import './style.css';
import LoadingSpinner from '../loading-spinner';

const LoadingSpinnerModal = () => (
    <div className="loading-spinner-modal">
        <div className="container">
            <div className="outer-wrapper">
                <div className="content">
                    <h4 className="text">Generating Playlist...</h4>
                    <LoadingSpinner />
                </div>
            </div>
        </div>
    </div>
);

export default LoadingSpinnerModal;
