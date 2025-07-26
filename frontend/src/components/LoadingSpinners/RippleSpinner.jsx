import React from 'react'

const RippleSpinner = () => {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen text-white space-y-6">
            <div className="relative w-20 h-20">
                <div className="absolute inline-block w-20 h-20 rounded-full border-4 border-blue-400 animate-ping"></div>
                <div className="absolute inline-block w-20 h-20 rounded-full border-4 border-blue-500"></div>
            </div>
            <h1 className="text-lg font-semibold text-blue-200 animate-pulse font-mono">
                Loading, please wait...
            </h1>
        </div>
    );
}

export default RippleSpinner;

