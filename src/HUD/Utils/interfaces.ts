export interface ConfigData {
    [key: string]: {
        id: number,
        name: string,
        initial: string,
        logo_data: string,
        team_color: string,
        header_color: string
    }
};

export interface TeamDataA {
    id: number,
    name: string,
    initial: string,
    logo_data: string,
    team_color: string,
    header_color: string
};

export interface BroadcastData {
    team_name: string,
    team_logo_data: string
};

export interface TeamPoints {
    team_id: number,
    team_points: number
};

export interface TeamElims {
    team_id: number,
    team_elims: number
};
