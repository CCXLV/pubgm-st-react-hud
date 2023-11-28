import axios from 'axios';

export function getTeamData() {
    return axios.get('http://localhost:3001/api/team_data')
    .then((response) => {
        return response.data
    })
    .catch((error) => {
        console.error('Error fetching image:', error);
    });
};

export function makeEditable(event: React.MouseEvent<HTMLSpanElement>) {
    const span = event.currentTarget;
    
    span.contentEditable = 'true';
    span.removeAttribute('disabled');
    span.focus();
};

export function handleBlur(event: React.FocusEvent<HTMLSpanElement>) {
    const span = event.currentTarget;
    
    if (span.innerHTML.trim() === '') {
        span.innerHTML = '0';
    }
    span.contentEditable = 'false';
    span.setAttribute('disabled', 'true');
};

export async  function handleKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
    if (event.key === 'Enter' && !event.shiftKey) {
        const span = event.target as HTMLElement;
        const teamName = span.parentElement?.parentElement?.parentElement?.parentElement?.querySelector('.control-team-name .team-name');
        const teamID = teamName?.id.match(/\d+/)?.[0] || '0';
        const teamPoints = span?.textContent || '0';

        try {
            await axios.post('http://localhost:3001/api/update_points', {
                data: {
                    team_id: parseInt(teamID), team_points: parseInt(teamPoints)
                }
            })
            span.innerHTML = '0';
            span.blur();
        } catch {
            console.log('Error sending team information!');
        }

    }
};

export function handleInput(event: React.FormEvent<HTMLSpanElement>) {
    const span = event.currentTarget;
    const currentValue = span.textContent!;
    const newValue = currentValue.replace(/[^\d]/g, '');

    if (currentValue !== newValue) {
        span.textContent = newValue;
    }
};

export function updateTablePreviewHeight() {
    const controlDiv = document.querySelector('.control-container') as HTMLElement;
    const tableDiv = document.querySelector('.table-container') as HTMLElement;

    if (controlDiv && tableDiv) {
        setTimeout(function() {
            const controlHeight = controlDiv.scrollHeight + 84;
        
            tableDiv.style.height = `${controlHeight}px`;
        }, 100)
    }
};

export async function getTeamPoints() {
    const data = await axios.get('http://localhost:3001/api/team_points');

    return data.data.data
};

export async function addPoints(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamID = button.parentElement?.parentElement?.parentElement?.parentElement?.querySelector('.control-team-name .team-name')?.id.match(/\d+/)?.[0] || '0';


    try {
        await axios.post('http://localhost:3001/api/update_points', {
            data: {
                team_id: parseInt(teamID), team_points: 1
            }
        })
    } catch {
        console.log('Something went wrong adding a point')
    }
};

export async function remPoints(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamID = button.parentElement?.parentElement?.parentElement?.parentElement?.querySelector('.control-team-name .team-name')?.id.match(/\d+/)?.[0] || '0';


    try {
        await axios.post('http://localhost:3001/api/update_points', {
            data: {
                team_id: parseInt(teamID), team_points: -1
            }
        })
    } catch {
        console.log('Something went wrong adding a point');
    }
};

export async function resetPoints(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamID = button.parentElement?.parentElement?.parentElement?.querySelector('.control-team-name .team-name')?.id.match(/\d+/)?.[0] || '0';


    try {
        await axios.post('http://localhost:3001/api/reset_points', {
            data: {
                team_id: parseInt(teamID), team_points: 0
            }
        })
    } catch {
        console.log('Something went wrong adding a point');
    }
}; 

export async function resetElims(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamID = button.parentElement?.parentElement?.parentElement?.querySelector('.control-team-name .team-name')?.id.match(/\d+/)?.[0] || '0';

    try {
        await axios.post('http://localhost:3001/api/reset_elims', {
            data: {
                team_id: parseInt(teamID), team_points: -2
            }
        })
    } catch {
        console.log('Something went wrong adding a point');
    }
}; 


export async function teamEliminated(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamDiv = button.parentElement?.parentElement?.parentElement;

    if (teamDiv !== null && teamDiv !== undefined) {
        teamDiv.style.backgroundColor = 'rgb(63, 75, 82)';
    }
    const teamNameSpan = teamDiv?.querySelector('.control-team-name .team-name');
    const teamID = teamNameSpan?.id.match(/\d+/)?.[0] || '0';

    const playerEliminateButtons = button.parentElement?.querySelectorAll('.player-eliminate-button');
    const playersKnockedButtons = button.parentElement?.querySelectorAll('.player-knocked-button');
    const eliminateMessage = button.parentElement?.querySelector('.team-eliminated') as HTMLElement;

    button.style.display = 'none';
    for (let i = 0; i < 3; i++) {
        if (playerEliminateButtons) {
            const b = playerEliminateButtons[i] as HTMLElement;
            b.style.display = 'none';
        }
    }
    playersKnockedButtons?.forEach((btn) => {
        const b = btn as HTMLElement;
        b.style.display = 'none';
    });
    eliminateMessage.style.display = 'flex';

    try {
        const response = await axios.post('http://localhost:3001/api/team_eliminated', {
            data: {
                team_id: parseInt(teamID), team_name: teamNameSpan?.textContent
            }
        })
        if (response.status === 200) {
            await axios.post('http://localhost:3001/api/players_update', {
                data: {
                    team_id: parseInt(teamID), team_name: teamNameSpan?.textContent, team_eliminated: true
                }
            })
        }

        const responseData = response.data;
        for (let i = 0; i < responseData.length; i++) {
            if (responseData[i]) {
                try {
                    await axios.post('http://localhost:3001/api/team_eliminated_sc', {
                        data: {
                            team_name: responseData[i].team_name, team_logo_data: responseData[i].team_logo_data
                        }
                    })
                } catch {
                    console.log('Error sending data.')
                }
            }
        }
    } catch {
        console.log('Something went wrong adding a point');
    }
};

export async function teamEliminatedHidden(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamDiv = button.parentElement?.parentElement?.parentElement;

    if (teamDiv !== null && teamDiv !== undefined) {
        teamDiv.style.backgroundColor = 'rgb(63, 75, 82)';
    }
    const teamNameSpan = teamDiv?.querySelector('.control-team-name .team-name');
    const teamID = teamNameSpan?.id.match(/\d+/)?.[0] || '0';

    const playerEliminateButtons = button.parentElement?.querySelectorAll('.player-eliminate-button');
    const playersKnockedButtons = button.parentElement?.querySelectorAll('.player-knocked-button');
    const eliminateMessage = button.parentElement?.querySelector('.team-eliminated') as HTMLElement;

    button.style.display = 'none';
    for (let i = 0; i < 3; i++) {
        if (playerEliminateButtons) {
            const b = playerEliminateButtons[i] as HTMLElement;
            b.style.display = 'none';
        }
    }
    playersKnockedButtons?.forEach((btn) => {
        const b = btn as HTMLElement;
        b.style.display = 'none';
    });
    eliminateMessage.style.display = 'flex';

    try {
        const response = await axios.post('http://localhost:3001/api/team_eliminated', {
            data: {
                team_id: parseInt(teamID), team_name: teamNameSpan?.textContent
            }
        })
        if (response.status === 200) {
            await axios.post('http://localhost:3001/api/players_update', {
                data: {
                    team_id: parseInt(teamID), team_name: teamNameSpan?.textContent, team_eliminated: true
                }
            })
        }

        const responseData = response.data;
        for (let i = 0; i < responseData.length; i++) {
            if (responseData[i]) {
                try {
                    await axios.post('http://localhost:3001/api/team_eliminated_sc', {
                        data: {
                            team_name: responseData[i].team_name, team_logo_data: responseData[i].team_logo_data
                        }
                    })
                } catch {
                    console.log('Error sending data.')
                }
            }
        }
    } catch {
        console.log('Something went wrong adding a point');
    }
};

export async function playersAlive4(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamDiv = button.parentElement?.parentElement;
    const teamID = button?.id.match(/\d+/)?.[0] || '0';

    const eliminateButton = button.parentElement?.querySelector('.eliminate-button') as HTMLElement;

    if (eliminateButton.style.display === 'none') {
        if (teamDiv !== null && teamDiv !== undefined) {
            teamDiv.style.backgroundColor = 'rgb(0, 122, 204)';
        }
    
        const playerEliminateButtons = button.parentElement?.querySelectorAll('.player-eliminate-button');
        const playersKnockedButtons = button.parentElement?.querySelectorAll('.player-knocked-button');
        const eliminateMessage = button.parentElement?.querySelector('.team-eliminated') as HTMLElement;
    
        eliminateMessage.style.display = 'none';
        button.style.display = 'flex';
        for (let i = 0; i < 3; i++) {
            if (playerEliminateButtons) {
                const b = playerEliminateButtons[i] as HTMLElement;
                b.style.display = 'flex';
            }
        }
        playersKnockedButtons?.forEach((btn) => {
            const b = btn as HTMLElement;
            b.style.display = 'flex';
        });
        eliminateButton.style.display = 'flex';
    }

    try {
        await axios.post('http://localhost:3001/api/players_update', {
            data: {
                team_id: parseInt(teamID), players_alive: 4
            }
        })
    } catch {
        console.log('Error sending players data!');
    } 
};

export async function playersAlive4Hidden(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamDiv = button.parentElement?.parentElement?.parentElement;
    const teamID = button?.id.match(/\d+/)?.[0] || '0';

    const eliminateButton = button.parentElement?.querySelector('.eliminate-button') as HTMLElement;

    if (eliminateButton.style.display === 'none') {
        if (teamDiv !== null && teamDiv !== undefined) {
            teamDiv.style.backgroundColor = 'rgb(0, 122, 204)';
        }
    
        const playerEliminateButtons = button.parentElement?.querySelectorAll('.player-eliminate-button');
        const playersKnockedButtons = button.parentElement?.querySelectorAll('.player-knocked-button');
        const eliminateMessage = button.parentElement?.querySelector('.team-eliminated') as HTMLElement;
    
        eliminateMessage.style.display = 'none';
        button.style.display = 'flex';
        for (let i = 0; i < 3; i++) {
            if (playerEliminateButtons) {
                const b = playerEliminateButtons[i] as HTMLElement;
                b.style.display = 'flex';
            }
        }
        playersKnockedButtons?.forEach((btn) => {
            const b = btn as HTMLElement;
            b.style.display = 'flex';
        });
        eliminateButton.style.display = 'flex';
    }

    try {
        await axios.post('http://localhost:3001/api/players_update', {
            data: {
                team_id: parseInt(teamID), players_alive: 4
            }
        })
    } catch {
        console.log('Error sending players data!');
    } 
};

export async function knockedPlayer(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamNameSpan = button.parentElement?.parentElement?.querySelector('.control-team-name .team-name');
    const teamID = button.parentElement?.id.match(/\d+/)?.[0] || '0';
    const knockedPlayers = button.id.match(/\d+/)?.[0] || '0';

    try {
        await axios.post('http://localhost:3001/api/players_update', {
            data: {
                team_id: parseInt(teamID), team_name: teamNameSpan?.textContent, players_knocked: parseInt(knockedPlayers)
            }
        })
    } catch {
        console.log('Error sending players data!');
    }
};

export async function knockedPlayerHidden(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamNameSpan = button.parentElement?.parentElement?.parentElement?.querySelector('.control-team-name .team-name');
    const teamID = button.parentElement?.id.match(/\d+/)?.[0] || '0';
    const knockedPlayers = button.id.match(/\d+/)?.[0] || '0';

    try {
        await axios.post('http://localhost:3001/api/players_update', {
            data: {
                team_id: parseInt(teamID), team_name: teamNameSpan?.textContent, players_knocked: parseInt(knockedPlayers)
            }
        })
    } catch {
        console.log('Error sending players data!');
    }
};

export async function eliminatedPlayer(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamNameSpan = button.parentElement?.parentElement?.querySelector('.control-team-name .team-name');
    const teamID = button.parentElement?.id.match(/\d+/)?.[0] || '0';
    const eliminatedPlayers = button.id.match(/\d+/)?.[0] || '0';

    try {
        await axios.post('http://localhost:3001/api/players_update', {
            data: {
                team_id: parseInt(teamID), team_name: teamNameSpan?.textContent, players_eliminated: parseInt(eliminatedPlayers)
            }
        })
    } catch {
        console.log('Error sending players data!');
    }
};

export async function eliminatedPlayerHidden(event: React.FormEvent<HTMLButtonElement>) {
    const button = event.target as HTMLElement;
    const teamNameSpan = button.parentElement?.parentElement?.parentElement?.querySelector('.control-team-name .team-name');
    const teamID = button.parentElement?.id.match(/\d+/)?.[0] || '0';
    const eliminatedPlayers = button.id.match(/\d+/)?.[0] || '0';

    try {
        await axios.post('http://localhost:3001/api/players_update', {
            data: {
                team_id: parseInt(teamID), team_name: teamNameSpan?.textContent, players_eliminated: parseInt(eliminatedPlayers)
            }
        })
    } catch {
        console.log('Error sending players data!');
    }
};

export function knockedOneEmit(teamID: number) {
    const playerOneDiv = document.querySelector(`.player-${teamID}-4`) as HTMLElement;
    const playerTwoDiv = document.querySelector(`.player-${teamID}-3`) as HTMLElement;
    const playerThreeDiv = document.querySelector(`.player-${teamID}-2`) as HTMLElement;

    if (playerOneDiv.classList.contains('eliminated-player') && !playerTwoDiv.classList.contains('eliminated-player')) {
        playerTwoDiv.classList.add('knocked-player');
    }
    if (playerOneDiv.classList.contains('eliminated-player') && playerTwoDiv.classList.contains('eliminated-player')) {
        playerThreeDiv.classList.add('knocked-player');
    }
    if (!playerOneDiv.classList.contains('eliminated-player')) {
        playerTwoDiv.classList.remove('knocked-player');
        playerThreeDiv.classList.remove('knocked-player');
        playerOneDiv.classList.add('knocked-player');
    }
};

export function knockedTwoEmit(teamID: number) {
    const playerOneDiv = document.querySelector(`.player-${teamID}-4`) as HTMLElement;
    const playerTwoDiv = document.querySelector(`.player-${teamID}-3`) as HTMLElement;
    const playerThreeDiv = document.querySelector(`.player-${teamID}-2`) as HTMLElement;

    if (playerOneDiv.classList.contains('eliminated-player') && !playerTwoDiv.classList.contains('eliminated-player')) {
        playerTwoDiv.classList.add('knocked-player');
        playerThreeDiv.classList.add('knocked-player')
    } 
    if (!playerOneDiv.classList.contains('eliminated-player') && !playerTwoDiv.classList.contains('eliminated-player')) {
        playerThreeDiv.classList.remove('knocked-player');
        playerOneDiv.classList.add('knocked-player');
        playerTwoDiv.classList.add('knocked-player');
    }
};

export function knockedThreeEmit(teamID: number) {
    const playerOneDiv = document.querySelector(`.player-${teamID}-4`) as HTMLElement;
    const playerTwoDiv = document.querySelector(`.player-${teamID}-3`) as HTMLElement;
    const playerThreeDiv = document.querySelector(`.player-${teamID}-2`) as HTMLElement;

    playerOneDiv.classList.add('knocked-player');
    playerTwoDiv.classList.add('knocked-player');
    playerThreeDiv.classList.add('knocked-player');
};

export function eliminatedOneEmit(teamID: number) {
    const playerOneDiv = document.querySelector(`.player-${teamID}-4`) as HTMLElement;
    const playerTwoDiv = document.querySelector(`.player-${teamID}-3`) as HTMLElement;
    const playerThreeDiv = document.querySelector(`.player-${teamID}-2`) as HTMLElement;

    playerOneDiv.classList.remove('knocked-player');
    playerTwoDiv.classList.remove('knocked-player');
    playerThreeDiv.classList.remove('knocked-player');
    playerTwoDiv.classList.remove('eliminated-player');
    playerOneDiv.classList.add('eliminated-player');
};

export function eliminatedTwoEmit(teamID: number) {
    const playerOneDiv = document.querySelector(`.player-${teamID}-4`) as HTMLElement;
    const playerTwoDiv = document.querySelector(`.player-${teamID}-3`) as HTMLElement;
    const playerThreeDiv = document.querySelector(`.player-${teamID}-2`) as HTMLElement;

    playerOneDiv.classList.remove('knocked-player');
    playerTwoDiv.classList.remove('knocked-player');
    playerThreeDiv.classList.remove('knocked-player');
    playerOneDiv.classList.add('eliminated-player');
    playerTwoDiv.classList.add('eliminated-player');
};

export function eliminatedThreeEmit(teamID: number) {
    const playerOneDiv = document.querySelector(`.player-${teamID}-4`) as HTMLElement;
    const playerTwoDiv = document.querySelector(`.player-${teamID}-3`) as HTMLElement;
    const playerThreeDiv = document.querySelector(`.player-${teamID}-2`) as HTMLElement;

    playerOneDiv.classList.remove('knocked-player');
    playerTwoDiv.classList.remove('knocked-player');
    playerThreeDiv.classList.remove('knocked-player');
    playerOneDiv.classList.add('eliminated-player');
    playerTwoDiv.classList.add('eliminated-player');
    playerThreeDiv.classList.add('eliminated-player');
};

export function aliveFourPlayersEmit(teamID: number) {
    const playerOneDiv = document.querySelector(`.player-${teamID}-4`) as HTMLElement;
    const playerTwoDiv = document.querySelector(`.player-${teamID}-3`) as HTMLElement;
    const playerThreeDiv = document.querySelector(`.player-${teamID}-2`) as HTMLElement;
    const playerFourDiv = document.querySelector(`.player-${teamID}-1`) as HTMLElement;

    const teamDiv = playerOneDiv.parentElement?.parentElement?.parentElement;
    if (teamDiv) {
        const teamRank = teamDiv.querySelector('.team-rank-side');
        teamRank?.classList.remove('eliminated-player-txt');

        const teamName = teamDiv.querySelector('.team-name');
        teamName?.classList.remove('eliminated-player-txt');

        const teamPts = teamDiv.querySelector('.team-pts');
        teamPts?.classList.remove('eliminated-player-txt');

        const teamElims = teamDiv.querySelector('.team-elims');
        teamElims?.classList.remove('eliminated-player-txt');

        const teamLogo = teamDiv.querySelector('.team-logo') as HTMLElement;
        teamLogo.style.filter = 'brightness(100%)';

        const teamColor = teamDiv.getAttribute('data-team-color') || '';
        teamDiv.style.backgroundColor = teamColor;
    }

    playerOneDiv.classList.remove('knocked-player');
    playerTwoDiv.classList.remove('knocked-player');
    playerThreeDiv.classList.remove('knocked-player');
    playerFourDiv.classList.remove('knocked-player');
    playerOneDiv.classList.remove('eliminated-player');
    playerTwoDiv.classList.remove('eliminated-player');
    playerThreeDiv.classList.remove('eliminated-player');
    playerFourDiv.classList.remove('eliminated-player');
};

function darkenColor(rgbColor: string, percent: number) {
    var parts = rgbColor.substring(rgbColor.indexOf("(") + 1, rgbColor.indexOf(")")).split(",");
    var r = parseInt(parts[0]);
    var g = parseInt(parts[1]);
    var b = parseInt(parts[2]);
  
    var subtractAmount = Math.round(255 * percent / 100);
  
    r = Math.max(r - subtractAmount, 0);
    g = Math.max(g - subtractAmount, 0);
    b = Math.max(b - subtractAmount, 0);
  
    return "rgb(" + r + ", " + g + ", " + b + ")";
};

function rgbOpacity(rgb: string, opacity: number) {
    const values = rgb.match(/\d+/g);
  
    if (values && values.length === 3) {
        const [r, g, b] = values;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else {
        console.error('Invalid RGB color format');
        return '';
    }
};

export function teamEliminatedEmit(teamID: number) {
    const playerOneDiv = document.querySelector(`.player-${teamID}-4`) as HTMLElement;
    const playerTwoDiv = document.querySelector(`.player-${teamID}-3`) as HTMLElement;
    const playerThreeDiv = document.querySelector(`.player-${teamID}-2`) as HTMLElement;
    const playerFourDiv = document.querySelector(`.player-${teamID}-1`) as HTMLElement;

    const teamDiv = playerOneDiv.parentElement?.parentElement?.parentElement;
    const teamDivColor = teamDiv?.style.backgroundColor || '';
    if (teamDiv) {
        const teamRank = teamDiv.querySelector('.team-rank-side');
        teamRank?.classList.add('eliminated-player-txt');

        const teamName = teamDiv.querySelector('.team-name-tb');
        teamName?.classList.add('eliminated-player-txt');

        const teamPts = teamDiv.querySelector('.team-pts');
        teamPts?.classList.add('eliminated-player-txt');

        const teamElims = teamDiv.querySelector('.team-elims');
        teamElims?.classList.add('eliminated-player-txt');

        const teamLogo = teamDiv.querySelector('.team-logo') as HTMLElement;
        teamLogo.style.filter = 'brightness(65%)';

        const darkerColor = darkenColor(teamDivColor, 25);
        const darkerColorM = rgbOpacity(darkerColor, 0.8);
        teamDiv.style.backgroundColor = darkerColorM;
    }

    playerOneDiv.classList.remove('knocked-player');
    playerTwoDiv.classList.remove('knocked-player');
    playerThreeDiv.classList.remove('knocked-player');
    playerFourDiv.classList.remove('knocked-player');
    playerOneDiv.classList.add('eliminated-player');
    playerTwoDiv.classList.add('eliminated-player');
    playerThreeDiv.classList.add('eliminated-player');
    playerFourDiv.classList.add('eliminated-player');
};

export function handleTeamBroadcast(team_name: string, team_logo_data: string, bck_color: string) {
    const broadcastDiv = document.querySelector('.broadcast-div') as HTMLElement & { showTimeout?: NodeJS.Timeout; hideTimeout?: NodeJS.Timeout; hideDelayTimeout?: NodeJS.Timeout };

    if (broadcastDiv) {
        const teamNameSpan = broadcastDiv.querySelector('.team-name-br');
        const teamLogoE = broadcastDiv.querySelector('.team-logo-br') as HTMLImageElement;
        const teamPlacementSpan = broadcastDiv.querySelector('.team-placement-br');

        broadcastDiv.style.background = `linear-gradient(to left, rgba(255, 0, 0, 0), ${bck_color}, rgba(255, 0, 0, 0)`;

        if (teamNameSpan && teamPlacementSpan) {
            teamNameSpan.innerHTML = team_name;
            teamLogoE.src = `data:image/png;base64,${team_logo_data}`;

            clearTimeout(broadcastDiv.showTimeout);
            clearTimeout(broadcastDiv.hideTimeout);
            clearTimeout(broadcastDiv.hideDelayTimeout);
            broadcastDiv.style.display = 'flex';

            broadcastDiv.showTimeout = setTimeout(function () {
                broadcastDiv.style.opacity = '1';
            }, 10);

            broadcastDiv.hideTimeout = setTimeout(function () {
                broadcastDiv.style.opacity = '0';
            }, 5000);

            broadcastDiv.hideDelayTimeout = setTimeout(function () {
                broadcastDiv.style.display = 'none';
            }, 6000);
        }
    }
}

