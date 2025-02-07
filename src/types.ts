export interface Title {
    title_id: string,
    type_id: string | null,
    name: string,
    is_adult: boolean,
    start_year: number | null,
    end_year: number | null,
    runtime_minutes: number | null,
}
