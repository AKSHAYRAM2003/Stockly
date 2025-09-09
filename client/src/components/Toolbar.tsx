import React from "react";

const Toolbar: React.FC = () => {
  return (
    <div
      className="sticky top-16 z-40 transition-shadow  px-0 pt-0 pb-3 
                 md:px-3 lg:px-5 flex justify-between items-center gap-8 shadow-md 
                 -mx-3 lg:-mx-5 w-[calc(100%+24px)] lg:w-[calc(100%+40px)]"
    >
      <div className="flex gap-2 w-full min-w-0">
        {/* Gradient Scroll Wrapper */}
        <div
          className="relative overflow-x-hidden grow flex flex-row items-start gap-2 [&>*]:grow
                     before:transition-opacity before:opacity-0 before:absolute before:inset-y-0
                     before:-left-px before:w-16 sm:before:w-32 before:pointer-events-none before:z-[-1]
                     before:bg-gradient-to-r after:transition-opacity after:opacity-0
                     after:absolute after:inset-y-0 after:-right-px after:w-16 sm:after:w-32
                     after:pointer-events-none after:z-[-1] after:bg-gradient-to-l
                     before:from-background/90 after:from-background/90 "
        >
          {/* Scrollable content */}
          <div className="scrollbars-none overflow-x-auto overflow-y-hidden">
            <div className="flex items-center justify-between gap-0 md:gap-2 w-full">
              {/* Left button group */}
              <div className="flex items-center gap-0 md:gap-2">
                {/* Tools */}
                <button
                  className="relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap
                             rounded-3xl font-medium ring-offset-background [&>svg]:shrink-0 hover:text-accent-foreground
                             border border-transparent   h-10 min-w-10 text-body [&_svg]:size-5 hover:bg-transparent
                             md:hover:bg-muted transition duration-400 ease-in-out z-20 outline-none px-2 ml-2    "
                  type="button"
                >
                  <span className="px-1">Tools</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    className="!size-[14px]"
                  >
                    <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
                  </svg>
                </button>

                {/* Reframe */}
                <button
                  className="relative shrink-0 whitespace-nowrap rounded-3xl font-medium ring-offset-background
                             [&>svg]:shrink-0 hover:text-accent-foreground border border-transparent h-10 min-w-10
                             px-3 text-body [&_svg]:size-5 items-center justify-start overflow-hidden gap-2
                             bg-transparent hover:bg-transparent md:hover:bg-muted mx-1 md:mx-0 hidden md:flex transition duration-400 ease-in-out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M240,192a8,8,0,0,1-8,8H200v32a8,8,0,0,1-16,0V200H64a8,8,0,0,1-8-8V72H24a8,8,0,0,1,0-16H56V24a8,8,0,0,1,16,0V184H232A8,8,0,0,1,240,192ZM96,72h88v88a8,8,0,0,0,16,0V64a8,8,0,0,0-8-8H96a8,8,0,0,0,0,16Z" />
                  </svg>
                  <span>Reframe</span>
                </button>

                {/* Restyle */}
                <button
                  className="relative shrink-0 whitespace-nowrap rounded-3xl font-medium ring-offset-background
                             [&>svg]:shrink-0 hover:text-accent-foreground border border-transparent h-10 min-w-10
                             px-3 text-body [&_svg]:size-5 items-center justify-start overflow-hidden gap-2
                             bg-transparent hover:bg-transparent md:hover:bg-muted transition duration-400 ease-in-out mx-1 md:mx-0 hidden md:flex"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z" />
                  </svg>
                  <span>Restyle</span>
                </button>

                {/* Background removal */}
                <button
                  className="relative shrink-0 whitespace-nowrap rounded-3xl font-medium ring-offset-background
                             [&>svg]:shrink-0 hover:text-accent-foreground border border-transparent h-10 min-w-10
                             px-3 text-body [&_svg]:size-5 items-center justify-start overflow-hidden gap-2
                             bg-transparent hover:bg-transparent md:hover:bg-muted transition duration-400 ease-in-out mx-1 md:mx-0 hidden md:flex"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M160,80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H160a16,16,0,0,0,16-16V96A16,16,0,0,0,160,80Zm0,128H48V96H160ZM136,40a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H144A8,8,0,0,1,136,40Zm88,8v8a8,8,0,0,1-16,0V48h-8a8,8,0,0,1,0-16h8A16,16,0,0,1,224,48Zm0,48v16a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm0,56v8a16,16,0,0,1-16,16h-8a8,8,0,0,1,0-16h8v-8a8,8,0,0,1,16,0ZM80,56V48A16,16,0,0,1,96,32h8a8,8,0,0,1,0,16H96v8a8,8,0,0,1-16,0Z" />
                  </svg>
                  <span>Background removal</span>
                </button>
              </div>

              {/* Right button group */}
              <div className="flex items-center shrink-0">
                <button
                  className="relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap
                             rounded-3xl font-medium ring-offset-background [&>svg]:shrink-0 hover:text-accent-foreground
                             border border-transparent h-10 min-w-10 px-3 text-body [&_svg]:size-5
                             pointer-events-auto z-20 hover:bg-transparent md:hover:bg-muted transition duration-400 ease-in-out mr-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    className="flex md:hidden"
                  >
                    <path d="M128,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h72A8,8,0,0,1,128,128ZM48,72H184a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Zm56,112H48a8,8,0,0,0,0,16h56a8,8,0,0,0,0-16Zm125.66-21.66a8,8,0,0,0-11.32,0L192,188.69V112a8,8,0,0,0-16,0v76.69l-26.34-26.35a8,8,0,0,0-11.32,11.32l40,40a8,8,0,0,0,11.32,0l40-40A8,8,0,0,0,229.66,162.34Z" />
                  </svg>
                  <span className="px-1 hidden md:flex">Daily picks</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    className="!size-[14px] hidden md:flex"
                  >
                    <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
