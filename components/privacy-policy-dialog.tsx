"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useAppTheme } from "@/contexts/theme-context";

interface PrivacyPolicyDialogProps {
    trigger?: React.ReactNode;
}

export function PrivacyPolicyDialog({ trigger }: PrivacyPolicyDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();
    const { isDarkTheme } = useAppTheme();

    return (
        <>
            {trigger ? (
                <span onClick={() => setIsOpen(true)} className="cursor-pointer text-primary hover:underline">
                    {trigger}
                </span>
            ) : (
                <span onClick={() => setIsOpen(true)} className="text-primary hover:underline cursor-pointer">
                    {t("用户协议", "Terms of Service")}
                </span>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className={`sm:max-w-md ${isDarkTheme ? "bg-slate-900 border-slate-800" : "bg-white"}`}>
                    <DialogHeader>
                        <DialogTitle className={isDarkTheme ? "text-white" : "text-gray-800"}>
                            {t("用户协议", "Terms of Service")}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 max-h-[70vh] overflow-y-auto">
                        <h3 className="text-lg font-medium mb-2">{t("隐私声明", "Privacy Statement")}</h3>
                        <p className="mb-4 text-muted-foreground">
                            {t(
                                "使用微信登录，将允许本网站获取你在微信的昵称、头像数据。",
                                "By using WeChat login, you allow this website to access your WeChat nickname and avatar data."
                            )}
                        </p>
                        <p className="mb-4 text-muted-foreground">
                            {t(
                                "用于留存访问数据。",
                                "Used to retain access data."
                            )}
                        </p>
                        <p className="text-muted-foreground">
                            {t(
                                "若长时间未登录而导致退出，可再次登录，重新授权。",
                                "If you are logged out due to inactivity, you can log in again and reauthorize."
                            )}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => setIsOpen(false)}
                        >
                            {t("我已了解", "I Understand")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 