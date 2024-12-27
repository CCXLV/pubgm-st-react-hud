import { useState, useEffect } from 'react';
import { ConfigData, TeamPoints, TeamElims, TeamDataA } from '../Utils/interfaces';

import '../index.css';
import './styles.css';

import { 
    getTeamData, 
    getTeamPoints, 
    knockedOneEmit, 
    knockedTwoEmit, 
    knockedThreeEmit, 
    aliveFourPlayersEmit, 
    teamEliminatedEmit, 
    eliminatedOneEmit, 
    eliminatedTwoEmit, 
    eliminatedThreeEmit
} from '../Utils/functions';

import io from 'socket.io-client';

const socket = io('http://localhost:3003');



function Table() {
    const [teamData, setTeamData] = useState<ConfigData | null>(null);
    const [teamPointsM, setTeamPointsM] = useState<TeamPoints[] | null>(null);
    const [teamElimsM, setTeamElimsM] = useState<{ [key: string]: TeamElims }>({});
    const [teamColor, setTeamColor] = useState('');
    const [headerColor, setHeaderColor] = useState('');
    const [teamDatasA, setTeamDatasA] = useState<TeamDataA[] | null>(null);;
    const [eliminatedTeams, setEliminatedTeams] = useState<number[]>([]);


    useEffect(() => {
        getTeamData().then((data) => {
            setTeamColor(data[0].team_color);
            setHeaderColor(data[0].header_color);
            setTeamData(data);
        });

        getTeamPoints().then((teamPoints) => {
            setTeamPointsM(teamPoints);
        });
    }, []);

    const teamColorStyle: React.CSSProperties = {
        backgroundColor: teamColor
    };
    const headerColorStyle: React.CSSProperties = {
        backgroundColor: headerColor
    }

    useEffect(() => {
        socket.on('players_update', (data) => {
            if (data.players_knocked) {
                if (data.players_knocked === 1) knockedOneEmit(data.team_id);
                if (data.players_knocked === 2) knockedTwoEmit(data.team_id);
                if (data.players_knocked === 3) knockedThreeEmit(data.team_id);
            }
            if (data.players_alive) {
                if (data.players_alive === 4) aliveFourPlayersEmit(data.team_id)
            }
            if (data.team_eliminated && !eliminatedTeams.includes(data.team_id)) {
                teamEliminatedEmit(data.team_id)
    
                setEliminatedTeams((prevTeams) => [...prevTeams, data.team_id]);
            }
            if (data.players_eliminated) {
                if (data.players_eliminated === 1) {
                    eliminatedOneEmit(data.team_id)
                }
                if (data.players_eliminated === 2) {
                    eliminatedTwoEmit(data.team_id)
                }
                if (data.players_eliminated === 3) {
                    eliminatedThreeEmit(data.team_id)
                }
            }
        })
        // eslint-disable-next-line
    }, [])

    
    useEffect(() => {
        const sortedTeamInfo: TeamPoints[] = teamPointsM ? teamPointsM.slice().sort((a, b) => b.team_points - a.team_points) : [];
    
        if (sortedTeamInfo.length > 0) {
            const updatedTeamDatasA: ConfigData[keyof ConfigData][] = sortedTeamInfo.map((team) => {
                const teamDataItem = teamData?.[team.team_id - 1];
                return teamDataItem || {
                    id: 0,
                    name: '',
                    initial: '',
                    logo_data: '',
                    team_color: '',
                    header_color: ''
                };
            });
    
            setTeamDatasA(updatedTeamDatasA);
        }


        socket.on('points-update', (data) => {
            const spanPts = document.querySelectorAll('.team-pts');
            let prevP: number = 0;
            
            spanPts.forEach((span) => {
                const teamID = span.id.match(/\d+/)?.[0] || '0';
                if (data.team_id === parseInt(teamID)) {
                    const previousPoints = parseInt(span.textContent || '0');
                    prevP = previousPoints;
                }
            });
            
            if (data.team_points !== -2) {
                if (data.team_points === -1) {
                    if (prevP !== 0) {
                        setTeamPointsM((prevPoints) => {
                            if (!prevPoints) {
                                return null;
                            }
        
                            const updatedPoints = [...prevPoints];
                            updatedPoints[data.team_id-1] = {
                                ...updatedPoints[data.team_id - 1],
                                team_points: prevP + data.team_points
                            }
        
                            return updatedPoints;
                        })
                    } else {
                        return
                    }
                } else {
                    setTeamPointsM((prevPoints) => {
                        if (!prevPoints) {
                            return null;
                        }
    
                        const updatedPoints = [...prevPoints];
                        updatedPoints[data.team_id-1] = {
                            ...updatedPoints[data.team_id - 1],
                            team_points: prevP + data.team_points
                        }
    
                        return updatedPoints;
                    })
                }
            }
    
            if (data.team_points === 0) {
                setTeamPointsM((prevPoints) => {
                    if (!prevPoints) {
                        return null;
                    }

                    const updatedPoints = [...prevPoints];
                    updatedPoints[data.team_id-1] = {
                        ...updatedPoints[data.team_id - 1],
                        team_points: 0
                    }

                    return updatedPoints;
                })
            }
    
            const spanElims = document.querySelectorAll('.team-elims');
            let prevE: number = 0;

            spanElims.forEach((span) => {
                const teamID = span.id.match(/\d+/)?.[0] || '0';
                if (data.team_id === parseInt(teamID)) {
                    const previousElims = parseInt(span.textContent || '0');
                    prevE = previousElims;
                }
            });
            
            setTeamElimsM((prevElims) => {
                if (!prevElims) {
                    return {};
                }

                const updatedElims = { ...prevElims };
                const teamIndex = data.team_id - 1;

                if (data.team_points === -1 && prevE > 0) {
                    updatedElims[teamIndex] = {
                        ...updatedElims[teamIndex],
                        team_elims: prevE - 1,
                    };
                } else if (data.team_points !== 0 && data.team_points >= 1) {
                    updatedElims[teamIndex] = {
                        ...updatedElims[teamIndex],
                        team_elims: prevE + data.team_points,
                        // team_elims: prevE + 1
                    };
                } else if (data.team_points === -2) {
                    updatedElims[teamIndex] = {
                        ...updatedElims[teamIndex],
                        team_elims: 0,
                    };
                }

                return updatedElims;
            });
        });
    }, [teamData, teamPointsM, teamElimsM]);


    
    return (
        <div>
            <div className='table-m'>
                <div className='table-header-m' style={headerColorStyle}>
                    <div className='blank-div'></div>
                    <div className='table-inner-element table-team-header'>TEAM</div>
                    <div className='table-inner-element table-alive-side'>ALIVE</div>
                    <div className='table-inner-element table-stats-side'>PTS</div>
                    <div className='table-inner-element table-stats-side'>ELIMS</div>
                </div>
                <div className='team-m-parent'>
                {teamPointsM && teamDatasA && teamDatasA.map((team, index) => (
                    <div className='team-m' key={index} style={teamColorStyle} data-team-color={teamColor}>
                        <div className='table-inner-element team-rank-side'>{index+1}</div>
                        <div className='table-inner-element team-team-side'>
                            <div className='table-inner-element team-logo-m'>
                                <img src={`data:image/png;base64, ${team.logo_data}`} alt="" className='team-logo' />
                            </div>
                            <div className='table-inner-element team-name-m'>
                                <span className='team-name-tb'>{(team.initial).toUpperCase()}</span>
                            </div>
                        </div>
                        <div className='table-inner-element team-stats-side'>
                            <div className='table-inner-element table-alive-side gap-5'>
                                <div className={`team-alive-dv player-${team.id}-1`}></div>
                                <div className={`team-alive-dv player-${team.id}-2`}></div>
                                <div className={`team-alive-dv player-${team.id}-3`}></div>
                                <div className={`team-alive-dv player-${team.id}-4`}></div>
                            </div>
                            <div className='table-inner-element table-stats-side'>
                                <div className='table-inner-element'>
                                    <span className='team-pts' id={`team-pts-${team.id}`}>{teamPointsM?.[team.id-1]?.team_points || 0}</span>
                                </div>
                            </div>
                            <div className='table-inner-element table-stats-side'>
                                <div className='table-inner-element'>
                                    <span className='team-elims' id={`team-elims-${team.id}`}>{teamElimsM?.[team.id-1]?.team_elims || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}

export default Table;
