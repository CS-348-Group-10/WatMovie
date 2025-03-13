export interface Title {
    id: string,
    type: string | null,
    title: string,
    is_adult: boolean,
    start_year: number | null,
    end_year: number | null,
    duration: number | null,
    rating: number | null,
    genres: string[] | null
}
