"use client"

import { formatCfa } from "@/lib/utils/formatters"
import { format } from "date-fns"

interface PayslipTemplateProps {
    payslip: {
        id: string
        month: number
        year: number
        basic_salary: number
        total_allowances: number
        total_deductions: number
        net_pay: number
        created_at: string
        staff: {
            first_name: string
            last_name: string
            hire_date?: string
            position?: {
                title: string
            }
            department?: {
                name: string
            }
        }
        allowances?: { name: string; amount: number }[]
        deductions?: { name: string; amount: number }[]
    }
}

export function PayslipTemplate({ payslip }: PayslipTemplateProps) {
    const payPeriod = `${format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy")}`
    const joinDate = payslip.staff.hire_date ? format(new Date(payslip.staff.hire_date), "yyyy-MM-dd") : "N/A"

    return (
        <div className="p-8 max-w-[800px] mx-auto bg-white text-black font-sans" id="payslip-print-area">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-wide mb-1">Payslip</h1>
                <h2 className="text-xl font-semibold">Remunera University</h2>
                <p className="text-sm text-gray-600">123 University Avenue, Academic City</p>
            </div>

            {/* Employee Details Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-8 text-sm">
                <div className="grid grid-cols-[120px_1fr]">
                    <span className="font-semibold">Date of Joining</span>
                    <span>: {joinDate}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr]">
                    <span className="font-semibold">Employee Name</span>
                    <span className="uppercase">: {payslip.staff.first_name} {payslip.staff.last_name}</span>
                    <div className="p-2 font-bold text-right">Amount</div>
                </div>

                {/* Basic Salary */}
                <div className="grid grid-cols-2 border-b border-gray-100">
                    <div className="p-2 border-r border-gray-300">Basic Salary</div>
                    <div className="p-2 text-right">{formatCfa(payslip.basic_salary)}</div>
                </div>

                {/* Allowances */}
                {payslip.allowances && payslip.allowances.length > 0 ? (
                    payslip.allowances.map((allowance, index) => (
                        <div key={index} className="grid grid-cols-2 border-b border-gray-100">
                            <div className="p-2 border-r border-gray-300">{allowance.name}</div>
                            <div className="p-2 text-right">{formatCfa(allowance.amount)}</div>
                        </div>
                    ))
                ) : (
                    <div className="grid grid-cols-2 border-b border-gray-100">
                        <div className="p-2 border-r border-gray-300">Other Allowances</div>
                        <div className="p-2 text-right">{formatCfa(payslip.total_allowances)}</div>
                    </div>
                )}

                <div className="grid grid-cols-2 border-t border-gray-300 font-bold bg-gray-50">
                    <div className="p-2 border-r border-gray-300">Total Earnings</div>
                    <div className="p-2 text-right">{formatCfa(payslip.basic_salary + payslip.total_allowances)}</div>
                </div>
            </div>

            <div className="border-t border-b border-gray-300 mb-8">
                <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-2 font-bold border-r border-gray-300">Deductions</div>
                    <div className="p-2 font-bold text-right">Amount</div>
                </div>

                {/* Deductions */}
                {payslip.deductions && payslip.deductions.length > 0 ? (
                    payslip.deductions.map((deduction, index) => (
                        <div key={index} className="grid grid-cols-2 border-b border-gray-100">
                            <div className="p-2 border-r border-gray-300">{deduction.name}</div>
                            <div className="p-2 text-right">{formatCfa(deduction.amount)}</div>
                        </div>
                    ))
                ) : (
                    <div className="grid grid-cols-2 border-b border-gray-100">
                        <div className="p-2 border-r border-gray-300">Total Deductions</div>
                        <div className="p-2 text-right">{formatCfa(payslip.total_deductions)}</div>
                    </div>
                )}

                <div className="grid grid-cols-2 border-t border-gray-300 font-bold bg-gray-50">
                    <div className="p-2 border-r border-gray-300">Total Deductions</div>
                    <div className="p-2 text-right">{formatCfa(payslip.total_deductions)}</div>
                </div>
            </div>

            {/* Net Pay */}
            <div className="flex justify-between items-center border-t-2 border-b-2 border-black py-4 mb-12">
                <div className="text-xl font-bold">Net Pay</div>
                <div className="text-xl font-bold">{formatCfa(payslip.net_pay)}</div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between mt-20">
                <div className="text-center">
                    <div className="border-t border-black w-48 mb-2"></div>
                    <p className="font-semibold">Employer Signature</p>
                </div>
                <div className="text-center">
                    <div className="border-t border-black w-48 mb-2"></div>
                    <p className="font-semibold">Employee Signature</p>
                </div>
            </div>

            <div className="text-center text-xs text-gray-500 mt-12">
                This is a system generated payslip.
            </div>
        </div>
    )
}
