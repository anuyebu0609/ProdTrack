import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import Header from "./Header"
import HeroSection from "./HeroSection"
import WhyChoose from "./WhyChoose"
import Stay from "./Stay"
import Footer from "./Footer"
import Dashboard from "./Dashboard"
import {createBrowserRouter,RouterProvider,Outlet} from "react-router-dom"
const Home=()=>{
    return(
        <div>
            <HeroSection/>
            <WhyChoose/>
            <Stay/>
            </div>
    )
}
const AppLayout=()=>{
    return(
        <div>
            <Header/>

            <Outlet/>
            <Footer/>
        </div>
    )
}
const Router=createBrowserRouter([{
    path:"/",
    element:<AppLayout/>,
    children:[{
        path:"/",
        element:<Home/>
    },
{
    path:"/Dashboard",
    element:<Dashboard/>
}]
}])


const Root=ReactDOM.createRoot(document.getElementById("root"))
Root.render(<RouterProvider router={Router}/>)