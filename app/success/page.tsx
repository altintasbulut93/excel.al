
"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download } from "lucide-react";
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900">Ödeme Başarılı!</h1>
            <p className="text-muted-foreground">
                Aboneliğiniz aktif edildi. Tüm premium özelliklere erişebilirsiniz.
            </p>

            <div className="space-y-3 pt-4">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    <Link href="/">Dashboard'a Dön</Link>
                </Button>
                <Button variant="outline" className="w-full">
                    Faturayı İndir
                </Button>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
            <Suspense fallback={<div>Yükleniyor...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
