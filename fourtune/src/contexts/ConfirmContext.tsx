import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import classes from './ConfirmModal.module.css';

interface ConfirmContextType {
    confirm: (message: string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [resolveFn, setResolveFn] = useState<(value: boolean) => void>(() => () => { });

    const confirm = useCallback((msg: string) => {
        setMessage(msg);
        setIsOpen(true);
        return new Promise<boolean>((resolve) => {
            setResolveFn(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolveFn(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolveFn(false);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {isOpen && (
                <div className={classes.overlay}>
                    <div className={classes.modal}>
                        <div className={classes.content}>
                            <p className={classes.message}>{message}</p>
                        </div>
                        <div className={classes.buttonGroup}>
                            <button className={classes.cancelButton} onClick={handleCancel}>
                                취소
                            </button>
                            <button className={classes.confirmButton} onClick={handleConfirm}>
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (context === undefined) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};
