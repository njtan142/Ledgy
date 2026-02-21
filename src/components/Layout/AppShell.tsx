import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { Outlet, useParams } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Moon, Sun, MonitorOff, LayoutDashboard, Settings, UserCircle, Database } from 'lucide-react';
import { useErrorStore } from '../../stores/useErrorStore';

export const AppShell: React.FC = () => {
    const {
        leftSidebarOpen, toggleLeftSidebar,
        rightInspectorOpen, toggleRightInspector,
        theme, toggleTheme
    } = useUIStore();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [mounted, setMounted] = useState(false);
    const { profileId } = useParams();
    const prevWidthRef = React.useRef(window.innerWidth);

    const { dispatchError } = useErrorStore();

    useEffect(() => {
        setMounted(true);
        // Initial responsive check
        const width = window.innerWidth;
        if (width < 900) {
            dispatchError("Mobile and Tablet layouts are not supported in this version.", "warning");
        }
        if (width < 1280) {
            useUIStore.getState().setRightInspector(false);
        }
        if (width < 1100) {
            useUIStore.getState().setLeftSidebar(false);
        }
    }, [dispatchError]);

    // Handle responsive breakpoints
    useEffect(() => {
        let timeoutId: number;

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                const width = window.innerWidth;
                const prevWidth = prevWidthRef.current;
                setIsMobile(width < 900);

                // Auto-collapse logic based on width boundary crossings
                if (prevWidth >= 1280 && width < 1280) {
                    useUIStore.getState().setRightInspector(false);
                }
                if (prevWidth >= 1100 && width < 1100) {
                    useUIStore.getState().setRightInspector(false);
                    useUIStore.getState().setLeftSidebar(false);
                }

                prevWidthRef.current = width;
            }, 100); // 100ms debounce
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="relative flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans">
            {isMobile && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm text-white p-6 text-center">
                    <div className="max-w-xs space-y-4">
                        <MonitorOff size={48} className="mx-auto text-emerald-500" />
                        <h1 className="text-xl font-bold italic tracking-tight">Ledgy Desktop</h1>
                        <p className="text-zinc-400 text-sm">
                            Mobile and Tablet layouts are not supported in this version.
                            Please switch to a desktop device or increase your window width.
                        </p>
                    </div>
                </div>
            )}

            {/* Left Sidebar */}
            <aside
                className={`flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md transition-[width] duration-300 ease-in-out shrink-0 overflow-hidden ${leftSidebarOpen ? 'w-[240px]' : 'w-[48px]'
                    }`}
            >
                <div className="h-14 flex items-center px-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                    <button
                        onClick={toggleLeftSidebar}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors"
                        title={leftSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        {leftSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>
                    {leftSidebarOpen && (
                        <span className="ml-3 font-bold italic text-emerald-500 text-lg select-none">Ledgy</span>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
                    <nav className="space-y-1 px-2">
                        <NavItem
                            icon={<LayoutDashboard size={18} />}
                            label="Dashboard"
                            active
                            collapsed={!leftSidebarOpen}
                        />
                        <NavItem
                            icon={<Database size={18} />}
                            label="Ledgers"
                            collapsed={!leftSidebarOpen}
                        />
                        <NavItem
                            icon={<UserCircle size={18} />}
                            label="Profiles"
                            collapsed={!leftSidebarOpen}
                        />
                        <NavItem
                            icon={<Settings size={18} />}
                            label="Settings"
                            collapsed={!leftSidebarOpen}
                        />
                    </nav>
                </div>

                <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center w-full h-9 rounded-md hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        {leftSidebarOpen && <span className="ml-3 text-sm font-medium">Theme</span>}
                    </button>
                </div>
            </aside>

            {/* Main Canvas */}
            <main className="flex-grow flex flex-col min-w-0 bg-transparent overflow-hidden">
                <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Dashboard</h2>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                    <Outlet context={{ profileId }} />
                </div>
            </main>

            {/* Right Inspector */}
            <aside
                className={`flex flex-col border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md transition-[width] duration-300 ease-in-out shrink-0 overflow-hidden ${rightInspectorOpen ? 'w-[280px]' : 'w-0'
                    }`}
            >
                <div className="h-14 flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                    <button
                        onClick={toggleRightInspector}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors"
                        title={rightInspectorOpen ? "Collapse Inspector" : "Expand Inspector"}
                    >
                        {rightInspectorOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                    </button>
                    {rightInspectorOpen && (
                        <span className="ml-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Inspector</span>
                    )}
                </div>
                <div className="flex-grow p-4">
                    {/* Inspector Content Placeholder */}
                    <div className="space-y-4">
                        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-white/10 rounded" />
                        <div className="h-32 bg-zinc-100 dark:bg-white/5 rounded-lg border border-zinc-200 dark:border-zinc-800" />
                    </div>
                </div>
            </aside>
        </div>
    );
};

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, collapsed }) => (
    <div
        className={`flex items-center h-10 px-3 mx-1 rounded-md transition-colors cursor-pointer group ${active
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5'
            }`}
    >
        <div className="shrink-0">{icon}</div>
        {!collapsed && (
            <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-opacity">
                {label}
            </span>
        )}
        {collapsed && (
            <div className="absolute left-14 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-zinc-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none z-50">
                {label}
            </div>
        )}
    </div>
);
