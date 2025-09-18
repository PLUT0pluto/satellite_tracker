'use client'
import React, { useCallback, useEffect, useState } from 'react';
import '../../style/dynamic_input.css';

interface Props2<DataType> {
    fName: string;
    items? : Array<string>;
    placeholder: string;
    onInputChange: (selectedItem: string) => Array<string>;
    onSugClick: (arg1:string, arg2:string, arg3:boolean) => void;
}

const DynamicInput = <DataType,>({
         fName,
         items = [],
         placeholder,
         onInputChange,
         onSugClick,
     }: Props2<DataType>) => {

    const[val, setVal] = React.useState('');
    const[inputSug, setInputSug] = React.useState(items);

    const inputChange = useCallback((
            event: React.ChangeEvent<HTMLInputElement>) => {
            setVal(event.target.value);
            setInputSug(onInputChange(event.target.value));
        },
        []
    );

    return (
        <div className='dynamic-input'>
            <input
                className='dinp-input'
                value = {val}
                onChange = {inputChange}
                placeholder={placeholder}
                type="text"/>

            {/* handle list of suggestions */}
            {
                inputSug.length > 0 && (
                <ul className='dinp-suggestions' role="listbox">
                    {inputSug.map((suggestion) => (
                        <li
                            className='dinp-suggestion-item'
                            role="option"
                            onMouseDown={(e) => e.preventDefault()}
                            key={suggestion}
                            onClick={() => {
                                setVal(suggestion);
                                setInputSug([]);
                                onSugClick(fName, suggestion, true)}}>
                            {suggestion} </li> ))}
                </ul> )
            }
        </div>
    );
}
DynamicInput.displayName = 'DynamicInput';
export { DynamicInput };