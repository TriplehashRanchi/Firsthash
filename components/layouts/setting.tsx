'use client';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { toggleTheme } from '@/store/themeConfigSlice'; // We only need this one action from Redux
import IconSun from '@/components/icon/icon-sun';
import IconMoon from '@/components/icon/icon-moon';
import IconLaptop from '@/components/icon/icon-laptop';

const Setting = () => {
    // Get the current theme state (e.g., 'light', 'dark') from the Redux store.
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();

    /**
     * This is the core function for the button. When clicked, it checks the
     * current theme and switches to the next one in the cycle.
     * The order is: Light -> Dark -> System -> Light.
     */
    const handleThemeToggle = () => {
        if (themeConfig.theme === 'light') {
            dispatch(toggleTheme('dark'));
        } else if (themeConfig.theme === 'dark') {
            dispatch(toggleTheme('system'));
        } else if (themeConfig.theme === 'system') {
            dispatch(toggleTheme('light'));
        }
    };

    return (
        // There is no sidebar panel. This is just the button itself,
        // styled and positioned to look exactly like the original.
        <button
            type="button"
            onClick={handleThemeToggle} // The button's click now directly changes the theme.
            aria-label="Toggle Theme"
            // --- STYLING & POSITIONING ---
            // This combination perfectly recreates the original button's look and feel.
            className="fixed top-1/2 z-50 flex h-10 w-12 -translate-y-1/2 cursor-pointer
                       items-center justify-center bg-primary text-white
                       ltr:right-0 ltr:rounded-tl-full ltr:rounded-bl-full
                       rtl:left-0 rtl:rounded-tr-full rtl:rounded-br-full"
        >
            {/*
             * The icon inside the button changes based on the current theme.
             * The spinning animation is kept for a dynamic feel.
            */}
            {themeConfig.theme === 'light' && (
                <IconSun className="h-5 w-5 animate-[spin_3s_linear_infinite]" />
            )}
            {themeConfig.theme === 'dark' && (
                <IconMoon className="h-5 w-5 " />
            )}
            {themeConfig.theme === 'system' && (
                <IconLaptop className="h-5 w-5 " />
            )}
        </button>
    );
};

export default Setting;