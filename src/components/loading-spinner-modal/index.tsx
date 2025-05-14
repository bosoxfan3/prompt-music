import View from './style';

import Modal from '../modal';
import LoadingSpinner from '../loading-spinner';

const LoadingSpinnerModal = () => {
    return (
        <Modal>
            <View>
                <h4 className="loading-spinner-modal__text">
                    Generating Playlist...
                </h4>
                <LoadingSpinner />
            </View>
        </Modal>
    );
};

export default LoadingSpinnerModal;
