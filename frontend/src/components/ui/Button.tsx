import React from "react";

//design interface for button component
interface ButtonProps{
children?:React.ReactNode; //children of button
onClick?:() => void; //onClick event handler
type?: "button" | "submit" | "reset"; //type of button      
className?: string; //additional class names for styling
 disabled?: boolean;
}

const Button: React.FC<ButtonProps>=({children,onClick,type = "button",className = "",disabled = false})=>{


    return(
       <button 
       type={type}
       onClick={onClick}
       disabled={disabled}
       className={`
        px-4 py-2 rounded-md
        bg-[var(--color-accent)]
        text-white
        hover:opacity-90 
        transition 
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${className}
      `}
       >
        {children}

       </button>
    )

}    


export default Button;