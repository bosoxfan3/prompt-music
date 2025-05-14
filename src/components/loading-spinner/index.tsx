import View from './style';

const LoadingSpinner = () => {
    return (
        <View>
            <div className="loading-spinner__item">
                <div className="loading-spinner__spinner">
                    <div className="loading-spinner__circle loading-spinner__circle-1">
                        <div className="loading-spinner__circle-inner" />
                    </div>
                    <div className="loading-spinner__circle loading-spinner__circle-2">
                        <div className="loading-spinner__circle-inner" />
                    </div>
                </div>
            </div>
        </View>
    );
};

export default LoadingSpinner;
