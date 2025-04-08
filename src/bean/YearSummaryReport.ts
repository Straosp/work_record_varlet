import type {WorkRecord} from "./WorkRecord.ts";

export interface YearSummaryReport {
    singleProductQuantity: number
    multipleProductQuantity: number
    maxSalaryWorkRecord: WorkRecord
    workDays: number,
    salary: number,
    startWorkDate: string
    endWorkDate: string
}