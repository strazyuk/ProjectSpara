import React from 'react';
import { useTellerConnect } from 'teller-connect-react';

interface TellerConnectProps {
    onSuccess: (accessToken: string) => void;
}

// Note: You need to set TELLER_APP_ID in your frontend .env
// VITE_TELLER_APP_ID=your_app_id

const TellerConnect: React.FC<TellerConnectProps> = ({ onSuccess }) => {

    const { open, ready } = useTellerConnect({
        applicationId: import.meta.env.VITE_TELLER_APP_ID || '',
        onSuccess: (authorization) => {
            console.log('Teller Connect Success:', authorization);
            // authorization object contains accessToken, user, enrollment, signatures
            onSuccess(authorization.accessToken);
        },
        onExit: () => {
            console.log('Teller Connect Exited');
        },
        // enrollment_id: optional if updating an existing enrollment
    });

    if (!import.meta.env.VITE_TELLER_APP_ID) {
        return <div className="text-red-500">Error: VITE_TELLER_APP_ID not set</div>;
    }

    return (
        <div>
            <button
                onClick={() => open()}
                disabled={!ready}
                className="bg-black text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-800 transition-colors"
            >
                Connect Bank via Teller
            </button>
        </div>
    );
};

export default TellerConnect;
