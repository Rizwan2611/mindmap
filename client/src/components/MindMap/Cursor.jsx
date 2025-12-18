const Cursor = ({ x, y, username, color = '#ff5722' }) => {
    return (
        <div style={{
            position: 'absolute',
            left: x,
            top: y,
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'transform 0.1s linear'
        }}>
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
                <path d="M5.65376 34.3333L0.900877 1.33202C0.669866 0.287823 1.83965 -0.528026 2.76865 0.176461L22.9904 15.5898C23.9056 16.2737 23.6309 17.7029 22.5204 17.9547L13.9189 19.9234L19.4678 29.5638C19.7828 30.1118 19.5934 30.8122 19.0464 31.1309L16.2526 32.7634C15.7056 33.0821 15.0044 32.8942 14.6853 32.3462L9.13621 22.7067L5.65376 34.3333Z" fill={color} />
                <path d="M12.5 20.5L18.5 30.5" stroke="white" strokeOpacity="0.5" />
            </svg>
            <div style={{
                backgroundColor: color,
                color: 'white',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '12px',
                marginLeft: '10px',
                whiteSpace: 'nowrap'
            }}>
                {username}
            </div>
        </div>
    );
};

export default Cursor;
