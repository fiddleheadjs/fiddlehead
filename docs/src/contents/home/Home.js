import './Home.less';
import {jsx} from 'core.pkg';
import {Intro} from './intro/Intro';

export let Home = () => {
    return (
        <div className="Home">
            <h1>Fiddlehead</h1>
            <Intro/>
        </div>
    );
};
