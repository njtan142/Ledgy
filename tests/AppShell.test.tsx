import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import '@testing-library/jest-dom';
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../src/components/Layout/AppShell";
import { useUIStore } from "../src/stores/useUIStore";
import { useErrorStore } from "../src/stores/useErrorStore";

// Mock stores
vi.mock("../src/stores/useUIStore", () => ({
    useUIStore: vi.fn(),
}));

vi.mock("../src/stores/useErrorStore", () => ({
    useErrorStore: vi.fn(),
}));

describe("AppShell Component", () => {
    const mockUseUIStore = vi.mocked(useUIStore);
    const mockUseErrorStore = vi.mocked(useErrorStore);


    const mockUIState = {
        leftSidebarOpen: true,
        toggleLeftSidebar: vi.fn(),
        rightInspectorOpen: true,
        toggleRightInspector: vi.fn(),
        setRightInspector: vi.fn(),
        theme: 'dark',
        toggleTheme: vi.fn(),
        setLeftSidebar: vi.fn(),
    };

    const mockErrorState = {
        error: null,
        dispatchError: vi.fn(),
        clearError: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseUIStore.mockReturnValue(mockUIState);
        (mockUseUIStore as any).getState = vi.fn().mockReturnValue(mockUIState);
        mockUseErrorStore.mockReturnValue(mockErrorState);

        // Reset window width to desktop default
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1440,
        });
    });

    it("renders all three panels on desktop (width >= 1280)", () => {
        render(
            <MemoryRouter>
                <AppShell />
            </MemoryRouter>
        );

        expect(screen.getByText(/Ledgy/i)).toBeInTheDocument();
        expect(screen.getByText(/Ledgy/i)).toBeInTheDocument();
        expect(screen.getByText(/Entry Details/i)).toBeInTheDocument();
        expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("performs initial responsive check on mount", () => {
        // Mock width between 1100 and 1279
        Object.defineProperty(window, 'innerWidth', { value: 1200 });

        render(
            <MemoryRouter>
                <AppShell />
            </MemoryRouter>
        );

        expect(mockUIState.setRightInspector).toHaveBeenCalledWith(false);
    });

    it("dispatches warning and collapses sidebar on mount if width < 1100", () => {
        // Mock width < 900
        Object.defineProperty(window, 'innerWidth', { value: 850 });

        render(
            <MemoryRouter>
                <AppShell />
            </MemoryRouter>
        );

        expect(mockErrorState.dispatchError).toHaveBeenCalledWith(
            expect.stringContaining("Mobile and Tablet layouts are not supported"),
            "warning"
        );
        expect(mockUIState.setLeftSidebar).toHaveBeenCalledWith(false);
    });

    it("shows mobile warning banner when width < 900", () => {
        // Change window width
        Object.defineProperty(window, 'innerWidth', { value: 800 });

        render(
            <MemoryRouter>
                <AppShell />
            </MemoryRouter>
        );

        expect(screen.getByText(/Mobile and Tablet layouts are not supported/i)).toBeInTheDocument();
    });


    it("hides Inspector when width is between 1100 and 1279", () => {
        // Assume resize has happened and rightInspectorOpen is false
        mockUseUIStore.mockReturnValue({ ...mockUIState, rightInspectorOpen: false });

        render(
            <MemoryRouter>
                <AppShell />
            </MemoryRouter>
        );

        const asides = screen.getAllByRole('complementary');
        const inspector = asides[1];
        expect(inspector).toHaveClass('w-0');
    });

    it("toggles sidebar when clicking the button", () => {
        render(
            <MemoryRouter>
                <AppShell />
            </MemoryRouter>
        );

        const asides = screen.getAllByRole('complementary');
        const sidebar = asides[0];
        const toggleBtn = sidebar.querySelector('button');
        if (toggleBtn) fireEvent.click(toggleBtn);
        expect(mockUIState.toggleLeftSidebar).toHaveBeenCalled();
    });

    it("auto-collapses panels on window resize", () => {
        vi.useFakeTimers();
        render(
            <MemoryRouter>
                <AppShell />
            </MemoryRouter>
        );

        // Resize to 1200 (hide inspector)
        Object.defineProperty(window, 'innerWidth', { value: 1200 });
        window.dispatchEvent(new Event('resize'));

        act(() => {
            vi.advanceTimersByTime(110);
        });
        expect(mockUIState.setRightInspector).toHaveBeenCalledWith(false);

        // Resize to 800 (hide sidebar too)
        Object.defineProperty(window, 'innerWidth', { value: 800 });
        window.dispatchEvent(new Event('resize'));

        act(() => {
            vi.advanceTimersByTime(110);
        });
        expect(mockUIState.setLeftSidebar).toHaveBeenCalledWith(false);

        vi.useRealTimers();
    });
});

