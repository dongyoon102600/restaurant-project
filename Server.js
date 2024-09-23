const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const corsOptions = {
    origin: 'http://www.ddagjoa.shop', // 허용할 도메인
    optionsSuccessStatus: 200 // 일부 브라우저에서 문제 해결을 위한 상태 코드
};

app.use(cors(corsOptions));

// Express 앱 설정
const app = express();
app.use(cors()); // CORS 정책 허용
app.use(bodyParser.json()); // JSON 데이터 파싱

// SQL Server 연결 설정 (SQL 인증 사용)
const config = {
    server: '192.168.150.110', // SQL Server 주소
    database: 'rastaurant',  // 사용할 데이터베이스 이름
    options: {
        encrypt: false, // 암호화 옵션이 필요한 경우
        enableArithAbort: true
    },
    authentication: {
        type: 'default',  // Windows 인증 사용
        options: {
            domain: 'www.ddagjoa.shop',  // 도메인 이름 (도메인이 없으면 이 줄은 생략 가능)
            userName: 'dongyoon',  // Windows 사용자 이름
            password: '12qwasZX!@'  // Windows 사용자 비밀번호 (도메인이 없는 로컬 사용자일 경우 필요 없음)
        }
    }
};

// SQL 연결
sql.connect(config, err => {
    if (err) {
        console.error('SQL 연결 오류:', err);
        process.exit(1); // SQL 연결 오류 발생 시 서버 종료
    } else {
        console.log('SQL Server에 연결되었습니다');
    }
});

// 주문 정보 저장 API
app.post('/api/order', async (req, res) => {
    const { customerName, totalPrice, items } = req.body;

    try {
        // SQL Server 연결 풀 생성 및 주문 데이터 저장 로직
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('CustomerName', sql.NVarChar, customerName)
            .input('TotalPrice', sql.Decimal(10, 2), totalPrice)
            .input('Items', sql.NVarChar(sql.MAX), JSON.stringify(items))
            .query('INSERT INTO orders (CustomerName, TotalPrice, Items) OUTPUT inserted.OrderID VALUES (@CustomerName, @TotalPrice, @Items)');

        // 성공적으로 삽입되었을 때 JSON 응답 반환
        res.json({ message: '주문이 성공적으로 저장되었습니다!', orderId: result.recordset[0].OrderID });
    } catch (err) {
        // 에러 발생 시 JSON 형식으로 응답
        res.status(500).json({ error: '주문 저장 중 오류가 발생했습니다.' });
    }
});

// 서버 실행
const port = 4000;
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다`);
});

// 서버 전체 예외 처리
process.on('uncaughtException', err => {
    console.error('예상치 못한 오류 발생:', err);
    process.exit(1); // 오류 발생 시 서버 종료
});

process.on('unhandledRejection', err => {
    console.error('비동기 오류 발생:', err);
    process.exit(1); // 오류 발생 시 서버 종료
});
