"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PayslipTemplate } from "@/components/payroll/payslip-template"
import { useParams } from "next/navigation"

export default function PayslipPrintPage() {
    const params = useParams()
    const id = params.id as string
    const [payslip, setPayslip] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const checkSessionAndFetch = async () => {
            const supabase = createClient()

            const { data: { session }, error: sessionError } = await supabase.auth.getSession()
            if (sessionError || !session) {
                setError("You are not logged in. Please log in to the dashboard first.")
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from("payslip")
                .select(`
          *,
          staff (
            first_name,
            last_name,
            hire_date,
            position (title)
          ),
          payslip_details (
             name,
             amount,
             type
          )
        `)
                .eq("id", id)
                .single()

            if (error) {
                setError(error.message)
            } else {
                // Process details into allowances and deductions
                const allowances = data.payslip_details?.filter((d: any) => d.type === 'allowance') || []
                const deductions = data.payslip_details?.filter((d: any) => d.type === 'deduction') || []

                setPayslip({ ...data, allowances, deductions })
            }
            setLoading(false)
        }

        if (id) {
            checkSessionAndFetch()
        }
    }, [id])

    useEffect(() => {
        if (!loading && payslip) {
            // Auto-print after a short delay to ensure rendering
            const timer = setTimeout(() => {
                window.print()
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [loading, payslip])

    if (loading) return <div className="p-8 text-center">Loading payslip...</div>

    if (error) return (
        <div className="p-8 text-center">
            <div className="text-red-500 font-bold mb-4">Error: {error}</div>
            <button
                onClick={() => window.close()}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
                Close Window
            </button>
        </div>
    )

    if (!payslip) return <div className="p-8 text-center">Payslip not found</div>

    return (
        <div>
            <div className="print:hidden p-4 bg-gray-100 flex justify-end gap-4">
                <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Print / Save as PDF
                </button>
                <button
                    onClick={() => window.close()}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Close
                </button>
            </div>
            <PayslipTemplate payslip={payslip} />
        </div>
    )
}
