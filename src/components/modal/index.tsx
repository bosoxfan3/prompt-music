import View from './style';

type Props = {
    children: React.ReactNode;
    className?: string;
};

const Modal = ({ children, className }: Props) => (
    <View>
        <div className="modal__container">
            <div className="modal__outer-wrapper">{children}</div>
        </div>
    </View>
);

export default Modal;
