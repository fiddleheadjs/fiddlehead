import {jsx} from '../../../output';
import React from 'react';

export function Svg1() {
    return (
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <polygon points="5,5 195,10 185,185 10,195" />
            <>
                <foreignObject x="20" y="20" width="160" height="160">
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{color: "#fff"}}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed mollis mollis mi ut ultricies. Nullam magna ipsum,
                        porta vel dui convallis, rutrum imperdiet eros. Aliquam
                        erat volutpat.
                    </div>
                </foreignObject>
            </>
        </svg>
    );
}
