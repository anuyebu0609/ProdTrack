import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import Header from "./Header"
import HeroSection from "./HeroSection"
import WhyChoose from "./WhyChoose"
import Stay from "./Stay"
import Footer from "./Footer"
const AppLayout=()=>{
    return(
        <div>
            <Header/>
            <HeroSection/>
            <WhyChoose/>
            <Stay/>
            <Footer/>
        </div>
    )
}

const Root=ReactDOM.createRoot(document.getElementById("root"))
Root.render(<AppLayout/>)