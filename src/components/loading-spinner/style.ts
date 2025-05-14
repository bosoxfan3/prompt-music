import styled from '@emotion/styled';

const LoadingSpinner = styled('div')`
    display: inline-block;

    & .loading-spinner {
        &__item {
            display: inline-block;
            margin-bottom: 1.5rem;
            vertical-align: middle;
        }

        &__spinner {
            display: inline-block;
            animation-name: anim-spinner;
            animation-duration: 1s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
        }

        &__circle {
            width: 2em;
            height: 1em;
            overflow: hidden;
        }

        &__circle-inner {
            transform: rotate(45deg);
            border-radius: 50%;
            border: 0.25em solid black;
            border-right: 0.25em solid transparent;
            border-bottom: 0.25em solid transparent;
            width: 100%;
            height: 200%;
            animation-name: anim-circle-1;
            animation-duration: 0.7s;
            animation-iteration-count: infinite;
            animation-direction: alternate;
            animation-timing-function: cubic-bezier(0.25, 0.1, 0.5, 1);
        }

        &__circle-2 {
            transform: rotate(180deg);

            &__circle-inner {
                animation-name: anim-circle-2;
            }
        }
    }

    @keyframes anim-circle-1 {
        from {
            transform: rotate(60deg);
        }
        to {
            transform: rotate(205deg);
        }
    }

    @keyframes anim-circle-2 {
        from {
            transform: rotate(30deg);
        }
        to {
            transform: rotate(-115deg);
        }
    }

    @keyframes anim-spinner {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;

export default LoadingSpinner;
