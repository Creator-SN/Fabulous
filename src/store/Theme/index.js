import onecolor from 'onecolor';

const Theme = {
    namespaced: true,
    state: {
        themeColor: 'rgba(149, 141, 241, 1)'
    },
    mutations: {

    },
    actions: {

    },
    getters: {
        color: state => {
            return state.themeColor;
        },
        color01: state => {
            let color = onecolor(state.themeColor);
            color = color.alpha(0.1);
            return color.cssa();
        },
        gradient: state => {
            let color = onecolor(state.themeColor);
            color = color.alpha(1);
            let from = color.cssa();
            let hsl = color.hsl();
            let h = Math.round(hsl.h() * 360);
            let s = hsl.s();
            let l = hsl.l();
            h = h + 25;
            s = (s - 0.1).toFixed(2);
            l = (l - 0.06).toFixed(2);
            let to = `hsla(${h}, ${s * 100}%, ${l * 100}%, 1)`;
            return `linear-gradient(to right, ${from}, ${to})`;
        },
        gradient01: state => {
            let color = onecolor(state.themeColor);
            color = color.alpha(0.1);
            let from = color.cssa();
            let hsl = color.hsl();
            let h = Math.round(hsl.h() * 360);
            let s = hsl.s();
            let l = hsl.l();
            h = h + 25;
            s = (s - 0.1).toFixed(2);
            l = (l - 0.06).toFixed(2);
            let to = `hsla(${h}, ${s * 100}%, ${l * 100}%, 0.1)`;
            return `linear-gradient(to right, ${from}, ${to})`;
        },
        gray01: state => {
            let color = onecolor(state.themeColor);
            color = color.alpha(1);
            let hsl = color.hsl();
            let h = hsl.h();
            let s = 0.1;
            let l = hsl.l();
            return `hsla(${h}, ${s * 100}%, ${l * 100}%, 1)`;
        }
    }
};

export default Theme;
