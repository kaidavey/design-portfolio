import { useState } from 'react';

export default function NavBar() {
    return (
        <div className="[font-synthesis:none] flex overflow-clip rounded-full items-center gap-2 p-1.5 justify-center [box-shadow:#00000005_0px_4px_8px] bg-white border border-solid border-[#F0F0F0] antialiased" style={{ translate: '-50%' }}>
            <NavButton icon={"h"} />
            <NavButton icon={"h"} />
            <NavButton icon={"h"} />
            <div className="w-[0.8px] h-6.5 rounded-full shrink-0 bg-[#DDDDDD]" />
            <div className="flex overflow-clip rounded-full flex-col items-center py-2.5 justify-center shrink-0 bg-origin-border bg-cover bg-position-[50%] [border-width:1.2px] border-solid border-[#EAEAEA] size-10" style={{ backgroundImage: 'url(https://app.paper.design/file-assets/01KWM3MAWXZNV08ENZMGME6W21/01KWMF0B5A2669H2Z3AZ8S9F8R.jpg)' }} />
        </div>
    );
}
  
export function NavButton({ icon }) {
    const [active, setActive] = useState(false);

    return (
        <button
            onClick={() => setActive((prev) => !prev)}
            style={{ backgroundImage: active ? 'linear-gradient(in oklab 90deg, oklab(95.5% 0 0) -24.56%, oklab(97.5% 0 0) 113.82%)' : '' }}
            className={`w-10 h-10 flex justify-center items-center -left-px -top-px ${
                active
                  ? "bg-[#FAFAFA] rounded-full [box-shadow:#FFFFFF_-0.5px_1.2px_0px_inset] bg-origin-border [border-width:1.2px] border-solid border-[#EAEAEA] size-10"
                  : ""
              }`}
        >
            {icon}
        </button>
    );
}