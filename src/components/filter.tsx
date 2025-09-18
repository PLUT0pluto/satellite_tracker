'use client';
import React, {useCallback, useState} from 'react';

interface Props3<DataType> {
    fName: string;
    fDetails: () => React.ReactElement<any, any>;
}

//sidebar filter component
const DynamicFilter = <DataType,>({
                                      fName,
                                      fDetails,
                                  }: Props3<DataType>) => {
    const [open, setOpen] = useState(false);

    const toggleDropdown = () => {
        setOpen((prev) => !prev);
    };

    return (
        <div className="selectClass borderCont">
            <div className={`select-header flex cursor-pointer items-center justify-between ${
                    open ? "open" : ""}`}
                 onClick={toggleDropdown}>
                <span className="">{fName}</span>
                <span className={`arrow ${open ? "rotated" : ""}`}>
                    <svg //arrow image
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4"
                        style={{ transform: 'rotate(-90deg)' }}>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                    </svg>
                </span>
            </div>

            {/* details */}
            <div className={`select-body ${open ? "expanded" : ""} border-t border-neutral-700 bg-white`}
                style={{ borderTopWidth: "2px",
                    overflowY: fName === "NAME" ? "auto" : "hidden",
                }} >
                {fDetails()}
            </div>
        </div>
    );
};

DynamicFilter.displayName = "DynamicFilter";
export { DynamicFilter };


