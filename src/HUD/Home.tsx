import './index.css';


function Home() {

    return (
        <div>
            <div className='home-container'>
                <a href="/control" className='home-button'>Control Panel</a>
                <a href="/table" className='home-button'>Table</a>
                <a href="/broadcast"className='home-button'>Elim Broadcast</a>
            </div>
        </div>
    );
}

export default Home;