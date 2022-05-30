import { useDispatch } from "react-redux";

import { toggleModal, setCurrentId } from "../../redux/reducers/modalSlice";

const FormElement = ({
    id,
    type,
    label,
    content,
    placeholder,
    options
}) => {
    const dispatch = useDispatch();

    const handleClick = () => {
        dispatch(toggleModal());
        dispatch(setCurrentId(id));
    }

    if (type === 'textarea') {
        return (
            <div className="form-element">
                <label>{label}</label>
                <textarea
                    placeholder={placeholder}
                />
                <button className="change-btn" onClick={handleClick}>&#8634;</button>
            </div>
        )
    } else if (type === 'select') {
        return (
            <div className="form-element">
                <label>{label}</label>
                <select>
                    {options.map((option, index) => {
                        return (
                            <option key={index + option}>
                                {option}
                            </option>
                        )
                    })}
                </select>
                <button className="change-btn" onClick={handleClick}>&#8634;</button>
            </div>
        )

    } else if (type === 'button') {
        return (
            <div className="form-element">
                <label>{label}</label>
                <button
                    type={type}
                    placeholder={placeholder}
                    className="btn"
                >
                    {content}
                </button>
                <button className="change-btn" onClick={handleClick}>&#8634;</button>
            </div>
        );
    } else if (type === 'checkbox') {
        return (
            <div className="form-element">
                <label>{label}</label>
                <input
                    type={type}
                />
                <button className="change-btn" onClick={handleClick}>&#8634;</button>
            </div>
        );
    } else if (type === 'radio') {
        return (
            <div className="form-element">
                <label>{label}</label>
                <input
                    type={type}
                />
                <button className="change-btn" onClick={handleClick}>&#8634;</button>
            </div>
        );
    } else {
        return (
            <div className="form-element">
                <label>{label}</label>
                <input
                    type={type}
                    placeholder={placeholder}
                />
                <button className="change-btn" onClick={handleClick}>&#8634;</button>
            </div>
        );
    }
}

export default FormElement;