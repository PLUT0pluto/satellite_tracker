'use client';
import React, { useCallback, useEffect, useState } from 'react';


interface Props<DataType> {
    label: string;
    items: Array<string>;
    startValue: string;
    onValueChange: (arg1:string, arg2:string, arg3:boolean) => void;
}



const DynamicSelect = <DataType,>({
          label,
          items,
          startValue,
          onValueChange
      }: Props<DataType>) => {

    const [nuSelected, setNuSelected] = useState(0);

    //handler for specific checkboxes
    const handleOnValueChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const { value, checked } = event.target;
            onValueChange(label, value, checked);

            //update counter od selected items
            setNuSelected(prevNuSelected => prevNuSelected + (checked ? 1 : -1));

            //update checkAll checkbox state
            const tempLabel = label.replaceAll(" ", "."); //class names cannot have spaces
            const checkboxes = document.querySelectorAll("." + tempLabel + "checkbox") as NodeListOf<HTMLInputElement>;
            const mCheck = document.querySelector("." + tempLabel + "checkbox" + "parent") as HTMLInputElement;
            const numChecked = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
            mCheck.checked = numChecked === checkboxes.length; //only check if all are checked otherwise uncheck
        },
        [onValueChange, label]
    );

    //handler for checkAll checkbox
    const parentCheck = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        let { checked } = event.target;
        const tempLabel = label.replaceAll(" ", ".");
        const checkboxes = document.querySelectorAll("." + tempLabel + "checkbox") as NodeListOf<HTMLInputElement>;

        //check or uncheck all checkboxes
        checkboxes.forEach((checkbox) => {
            if(checkbox.checked !== checked) {
                checkbox.checked = checked;

                //have to manually call the handleOnValueChange
                handleOnValueChange({
                    target: checkbox,
                    currentTarget: checkbox,
                } as React.ChangeEvent<HTMLInputElement>);
            }
        });
    }, [label, handleOnValueChange]);

    //have to manually prevent autofocus when clicking on checkboxes
    //preventDefault for some reason does not work disable autoscoll
    const preventScroll = useCallback(() => {
        // get the current page scroll position
        const scrollTop =
            window.pageYOffset ||
            document.documentElement.scrollTop;
        const scrollLeft =
            window.pageXOffset ||
            document.documentElement.scrollLeft;

        //set to fixed position if scrolled
        window.onscroll = function () {
            window.scrollTo(scrollLeft, scrollTop);
        };

        //wait a bit then re-enable scrolling
        setTimeout(() => {
            window.onscroll = function () {};
        }, 500);


    }, []);
    const preventDefaultMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    return (
        <div className="dynamicSelectDiv" onMouseDown={preventScroll}>
            <header className="flex" style={{padding: '10px', paddingBlock: '15px', justifyContent: 'space-between', alignItems: 'center'}}>
                <label className="inline-flex items-center gap-2">
                    <input type="checkbox" onChange={parentCheck} className = {label + "checkbox" + "parent"} onMouseDown={(e) => e.preventDefault()}/>
                    <span className="checkmark checkmarktransition"></span>
                </label>
                <span className="selected-count text-sm text-gray-700"> {String(nuSelected) + " selected"} </span>

            </header>

            {/* border between header and the rest */}
            <div className="flex justify-center">
                <hr className="border-neutral-700" style={{width: '95%', borderTopWidth: '2px'}}></hr>
            </div>

            {/* list of options */}
            <ul className="option-list filterDetails space-y-1 p-4" onMouseDown={preventDefaultMouseDown}>
                {items.map((item, index) => (
                    <li className="option-item" key={index} onMouseDown={preventDefaultMouseDown}>
                        <label className="inline-flex items-center gap-2" onMouseDown={preventDefaultMouseDown}>
                            <input type="checkbox" id={String(index)} value={item} className={label + "checkbox"}
                                   onChange={handleOnValueChange} onMouseDown={preventDefaultMouseDown}/>
                            <span className="checkmark checkmarktransition" onMouseDown={preventDefaultMouseDown}></span>
                            <span className="text-gray-700" onMouseDown={preventDefaultMouseDown}> {item} </span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>

    );
};


DynamicSelect.displayName = 'DynamicSelect';
export { DynamicSelect };