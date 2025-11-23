import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAccountStore } from '../../../stores/useAccountStore';

import Loading from '../loading';


const ProtectedUserRoute = (props) => {
    const isAuthenticated = useAccountStore((state) => state.isAuthenticated);
    const isLoading = useAccountStore((state) => state.isLoading);
    const [redirectToLogin, setRedirectToLogin] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                setRedirectToLogin(true);
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [isLoading]);

    if (redirectToLogin) {
        return <Navigate to='/login' replace />;
    }

    return (
        <>
            {isLoading === true ? (
                <Loading />
            ) : (
                <>
                    {isAuthenticated === true ? (
                        props.children
                    ) : (
                        <Navigate to='/login' replace />
                    )}
                </>
            )}
        </>
    )
}

export default ProtectedUserRoute