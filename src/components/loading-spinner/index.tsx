import './style.css';

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner">
            <div className="item">
                <div className="spinner">
                    <div className="circle">
                        <div className="circle-inner" />
                    </div>
                    <div className="circle circle-2">
                        <div className="circle-inner" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
