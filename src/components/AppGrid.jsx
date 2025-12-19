import { useNavigate } from 'react-router-dom';
import Card from './Card';
import iconChat from '../assets/icon-chat.png';
import iconImage from '../assets/icon-image.png';
import iconCode from '../assets/icon-code.png';
import iconDocs from '../assets/icon-docs.png';

const AppGrid = () => {
    const navigate = useNavigate();
    const apps = [
        { title: 'Real Estate Calculator', color: 'rgba(192, 132, 252, 0.4)', icon: iconChat, path: `${import.meta.env.BASE_URL}app/01. property cal/index.html`, isExternal: true },
        { title: 'Lotto Analyzer', color: 'rgba(74, 222, 128, 0.4)', icon: iconImage, path: `${import.meta.env.BASE_URL}app/02. Lotto Number choice/index.html`, isExternal: true },
        { title: 'Car Auction Search', color: 'rgba(56, 189, 248, 0.4)', icon: iconCode, path: `${import.meta.env.BASE_URL}app/03. car search/index.html`, isExternal: true },
        { title: 'Documents', color: 'rgba(45, 212, 191, 0.4)', icon: iconDocs, path: null, isComingSoon: true },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            padding: '40px 0'
        }}>
            {apps.map((app, index) => (
                <Card
                    key={index}
                    {...app}
                    onClick={() => {
                        if (app.isComingSoon) return;
                        if (app.isExternal) {
                            window.location.href = app.path;
                        } else {
                            navigate(app.path);
                        }
                    }}
                    style={app.isComingSoon ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                />
            ))}
        </div>
    );
};

export default AppGrid;
