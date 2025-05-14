import styled from '@emotion/styled';

export default styled('div')`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(34, 34, 43, 0.5);
    z-index: 9999;
    overflow-y: auto;

    & .modal {
        &__container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        &__wrapper {
            margin: 1.5rem;
        }

        &__outer-wrapper {
            background: #f7f8fd;
            border-radius: 0.25rem;
            overflow: auto;
        }
    }
`;
