import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mainApi from '@/apis/main.api';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(true);
    const [hasShownAlert, setHasShownAlert] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const verifyToken = async () => {
            try {
                const response = await mainApi.get('/v1/auth/verify', {
                    withCredentials: true
                });
                if (!response.data.success && isMounted && !hasShownAlert) {
                    alert("plase login again");
                    setHasShownAlert(true);
                    navigate('/');
                }
            } catch (error) {
                if (isMounted && !hasShownAlert) {
                    alert("plase login again");
                    setHasShownAlert(true);
                    navigate('/');
                }
            } finally {
                if (isMounted) {
                    setIsVerifying(false);
                }
            }
        };
        verifyToken();

        return () => {
            isMounted = false;
        };
    }, [navigate, hasShownAlert]);

    if (isVerifying) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;