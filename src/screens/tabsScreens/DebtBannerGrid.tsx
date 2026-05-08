import { Animated } from "react-native"


export const DebtBannerGrid = ({ SharedStyles }: { SharedStyles: any }) => {

    return (
        <Animated.View

            style={[
                SharedStyles,
                { width: '92%', height: '80%', position: 'absolute', top: '7%', left: '4%', zIndex: 50, transformOrigin: "top right" }
            ]}
            className="rounded-[35px] bg-garage-950/85 border border-main-900/70 shadow-2xl "
        >



        </Animated.View>
    )
}