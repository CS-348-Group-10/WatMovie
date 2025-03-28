export interface Movie {
    id: string,
    movie: string,
    is_adult: boolean,
    release_year: number,
    duration: number | null,
    imdb_rating: number | null,
    imdb_votes: number | null,
    user_rating: number | null,
    user_votes: number | null,
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
    role_id: number,
    job: string,
    characters: string
}

export type MovieRole = {
    id: string,
    name: string
}

export enum SortType {
    IMDB_RATING = 'imdb_rating',
    USER_RATING = 'user_rating',
    TITLE = 'title',
    YEAR = 'year',
    RUNTIME = 'runtime'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}
