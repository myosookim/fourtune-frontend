import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classes from './Auth.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

import googleSignIn1x from '../../assets/social/google/si/web_light_sq_SI@1x.png';
import googleSignIn2x from '../../assets/social/google/si/web_light_sq_SI@2x.png';
import googleSignIn3x from '../../assets/social/google/si/web_light_sq_SI@3x.png';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (error: any) {
            let message = '로그인에 실패했습니다.';
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    message = error.response.data;
                } else if (error.response.data.message) {
                    message = error.response.data.message;
                }
            }
            showToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={classes.container}>
            <div className={classes.authCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ border: 'none', padding: 0 }}>
                        &larr; 뒤로가기
                    </button>
                    <Link to="/" className="btn btn-outline btn-sm" style={{ border: 'none', padding: 0 }}>
                        메인으로 🏠
                    </Link>
                </div>
                <h1 className={classes.title}>로그인</h1>
                <form onSubmit={handleSubmit} className={classes.form}>
                    <div className={classes.formGroup}>
                        <label htmlFor="email" className={classes.label}>이메일</label>
                        <input
                            id="email"
                            type="email"
                            className={classes.input}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={classes.formGroup}>
                        <label htmlFor="password" className={classes.label}>비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            className={classes.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={`btn btn-primary ${classes.submitBtn}`} disabled={isLoading}>
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className={classes.divider}>또는</div>

                <div className={classes.socialContainer}>
                    <img
                        src={googleSignIn1x}
                        srcSet={`${googleSignIn1x} 1x, ${googleSignIn2x} 2x, ${googleSignIn3x} 3x`}
                        alt="Sign in with Google"
                        className={classes.googleImgBtn}
                        onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
                    />
                </div>
                <div className={classes.footer}>
                    계정이 없으신가요?
                    <Link to="/signup" className={classes.link}>회원가입</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
