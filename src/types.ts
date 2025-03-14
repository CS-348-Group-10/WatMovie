export interface Title {
    id: string,
    type_id: number | null,
    title: string,
    is_adult: boolean,
    start_year: number | null,
    end_year: number | null,
    duration: number | null,
    rating: number | null,
    votes: number | null,
    genre_ids: number[] | null,
    cast: Cast[] | null
}

export type Genre = {
    id: string,
    name: string
}

export type Cast = {
    id: string,
    name: string,
    ordering: number,
    category_id: number,
    job: string,
    characters: string
}

export type MemberCategory = {
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
