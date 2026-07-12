import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type VerifyBody = {
  dealId?: string;
  paymentId?: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyBody;

    const dealId = body.dealId;
    const paymentId = body.paymentId;

    if (!dealId || !paymentId) {
      return jsonError("بيانات الدفع ناقصة");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const moyasarSecretKey = process.env.MOYASAR_SECRET_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonError("إعدادات Supabase ناقصة في السيرفر", 500);
    }

    if (!moyasarSecretKey) {
      return jsonError("مفتاح Moyasar السري غير موجود في السيرفر", 500);
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    const { data: deal, error: dealError } = await adminSupabase
      .from("deals")
      .select("*")
      .eq("id", dealId)
      .maybeSingle();

    if (dealError) {
      return jsonError(dealError.message, 500);
    }

    if (!deal) {
      return jsonError("لم يتم العثور على الصفقة", 404);
    }

    if (deal.status === "paid" || deal.status === "completed") {
      return NextResponse.json({
        success: true,
        deal,
        message: "تمت معالجة الدفع مسبقًا",
      });
    }

    if (deal.status !== "pending") {
      return jsonError("هذه الصفقة غير قابلة للدفع الآن");
    }

    const auth = Buffer.from(`${moyasarSecretKey}:`).toString("base64");

    const moyasarResponse = await fetch(
      `https://api.moyasar.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const payment = await moyasarResponse.json();

    if (!moyasarResponse.ok) {
      return jsonError(
        payment?.message || "فشل جلب عملية الدفع من Moyasar",
        400
      );
    }

    const expectedAmount = Math.round(Number(deal.amount || 0) * 100);
    const paidAmount = Number(payment.amount || 0);
    const currency = String(payment.currency || "").toUpperCase();
    const status = String(payment.status || "");
    const paymentDealId = payment.metadata?.deal_id;

    if (status !== "paid") {
      return jsonError("عملية الدفع لم تنجح");
    }

    if (paidAmount !== expectedAmount) {
      return jsonError("مبلغ الدفع لا يطابق مبلغ الصفقة");
    }

    if (currency !== "SAR") {
      return jsonError("عملة الدفع غير صحيحة");
    }

    if (paymentDealId && String(paymentDealId) !== String(dealId)) {
      return jsonError("عملية الدفع لا تخص هذه الصفقة");
    }

    const paymentMethod =
      payment.source?.type ||
      payment.source?.company ||
      payment.source?.name ||
      "moyasar";

    const { data: updatedDeal, error: updateDealError } =
      await adminSupabase
        .from("deals")
        .update({
          status: "paid",
          payment_id: paymentId,
          payment_status: status,
          payment_method: paymentMethod,
          paid_at: new Date().toISOString(),
        })
        .eq("id", dealId)
        .eq("status", "pending")
        .select("*")
        .maybeSingle();

    if (updateDealError) {
      return jsonError(updateDealError.message, 500);
    }

    if (!updatedDeal) {
      const { data: latestDeal } = await adminSupabase
        .from("deals")
        .select("*")
        .eq("id", dealId)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        deal: latestDeal,
        message: "تمت معالجة الصفقة مسبقًا",
      });
    }

    const commission = Number(deal.commission || 0);
    const sellerAmount = Number(deal.seller_amount || 0);

    const { data: adminWallet, error: adminReadError } = await adminSupabase
      .from("admin_wallet")
      .select("total_profit,profit_pending_transfer")
      .eq("id", 1)
      .maybeSingle();

    if (adminReadError) {
      return jsonError(adminReadError.message, 500);
    }

    if (adminWallet) {
      const { error: adminUpdateError } = await adminSupabase
        .from("admin_wallet")
        .update({
          total_profit: Number(adminWallet.total_profit || 0) + commission,
          profit_pending_transfer:
            Number(adminWallet.profit_pending_transfer || 0) + commission,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (adminUpdateError) {
        return jsonError(adminUpdateError.message, 500);
      }
    } else {
      const { error: adminInsertError } = await adminSupabase
        .from("admin_wallet")
        .insert({
          id: 1,
          total_profit: commission,
          profit_pending_transfer: commission,
          profit_transferred: 0,
          updated_at: new Date().toISOString(),
        });

      if (adminInsertError) {
        return jsonError(adminInsertError.message, 500);
      }
    }

    const { data: sellerWallet, error: walletReadError } =
      await adminSupabase
        .from("wallets")
        .select("balance,frozen_balance,transferred_balance,pending_transfer_balance")
        .eq("user_id", deal.seller_id)
        .maybeSingle();

    if (walletReadError) {
      return jsonError(walletReadError.message, 500);
    }

    if (sellerWallet) {
      const { error: walletUpdateError } = await adminSupabase
        .from("wallets")
        .update({
          frozen_balance:
            Number(sellerWallet.frozen_balance || 0) + sellerAmount,
        })
        .eq("user_id", deal.seller_id);

      if (walletUpdateError) {
        return jsonError(walletUpdateError.message, 500);
      }
    } else {
      const { error: walletInsertError } = await adminSupabase
        .from("wallets")
        .insert({
          user_id: deal.seller_id,
          owner_name: null,
          bank_name: null,
          iban: null,
          account_number: null,
          balance: 0,
          frozen_balance: sellerAmount,
          transferred_balance: 0,
          pending_transfer_balance: 0,
        });

      if (walletInsertError) {
        return jsonError(walletInsertError.message, 500);
      }
    }

    return NextResponse.json({
      success: true,
      deal: updatedDeal,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: paymentMethod,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "حدث خطأ غير متوقع";

    return jsonError(message, 500);
  }
}