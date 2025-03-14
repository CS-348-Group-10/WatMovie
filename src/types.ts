export interface Title {
    id: string,
    type: string | null,
    title: string,
    is_adult: boolean,
    start_year: number | null,
    end_year: number | null,
    duration: number | null,
    rating: number | null,
    genre_ids: string[] | null
}

export type Genre = {
    id: string,
    name: string
}

export enum SortType {
    RATING = 'rating',
    TITLE = 'title',
    YEAR = 'year',
    RUNTIME = 'runtime'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}
