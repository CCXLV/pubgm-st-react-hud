import { useState, useEffect } from 'react';

import { BroadcastData } from '../Utils/interfaces';

import { getTeamData, handleTeamBroadcast } from '../Utils/functions';

import './styles.css';

import io from 'socket.io-client';

const socket = io('http://localhost:3003');

function ElimBroadcast() {
    const [teamsLength, setTeamsLength] = useState<number>(0);
    const [teamsLengthM, setTeamsLengthM] = useState<number>(0);
    const [teamColor, setTeamColor] = useState('');

    useEffect(() => {
        getTeamData().then((data) => {
            setTeamColor(data[0].team_color);
            setTeamsLength(data.length + 1);
            setTeamsLengthM(data.length)
        });
    }, []);

    useEffect(() => {
        const handleTeamEliminate = (data: BroadcastData) => {
            setTeamsLength((prevTeamsLength) => {
                if (prevTeamsLength > 0) {
                    return prevTeamsLength - 1;
                }
                return prevTeamsLength;
            });
            handleTeamBroadcast(data.team_name, data.team_logo_data, teamColor);
        };
    
        socket.on('team-eliminate', handleTeamEliminate);
    
        return () => {
            socket.off('team-eliminate', handleTeamEliminate);
        };
    }, [teamsLength]);
    

    return (
        <div>
            <div className='broadcast-div'>
                <img src='' alt="" className='team-logo-br'/>
                <p className='team-name-br-p'>
                    <span className='team-name-br'></span> IS ELIMINATED <span className='team-placement-br'>#{teamsLength}/{teamsLengthM}</span>
                </p>
            </div>
        </div>
    );
}

export default ElimBroadcast;
