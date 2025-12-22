import Image from "next/image";
import React from "react";
import OAuth from "../auth/o-auth";
import Logo from "../shared/logo";

const authLayoutImages = [
  { link: "/images/auth/auth3.jpg" },
  { link: "/images/auth/auth2.jpg" },
  { link: "/images/auth/auth1.jpg" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full relative flex items-center justify-center text-foreground">
      <div className="relative w-[90%] max-w-7xl h-[90%] max-h-[800px] bg-linear-to-br from-primary/[0.003] to-secondary/[0.003] backdrop-blur-xl rounded-3xl overflow-hidden  border">
        <div className="absolute top-5 left-5">
            <Logo />
        </div>
        <div className="flex flex-col lg:flex-row h-full">
          <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col gap-6 items-center justify-center p-8 lg:p-12">
            <div className="w-full">{children}</div>

            <div className="w-full">
              <OAuth />
            </div>
          </div>

          <div className="relative hidden lg:block lg:w-[55%] xl:w-[60%] h-full items-center justify-center overflow-hidden ">
            <div className="w-full h-[20%] flex flex-col items-center justify-center text-center">
              <h1 className="text-3xl md:text-5xl font-light leading-tight ">
                See What&apos;s Happening <br />
                this{" "}
                <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  beautiful world
                </span>
                .
              </h1>
            </div>

            {/* Image Stack */}
            <div className="relative w-full h-[80%] flex items-start justify-center">
              {authLayoutImages.map((el, index) => {
                const styles = [
                  "rotate-0 scale-100 z-10",
                  "rotate-[-12deg] translate-x-[-140px] scale-90",
                  "rotate-[12deg] translate-x-[140px] scale-90",
                ];

                return (
                  <div
                    key={index}
                    className={`absolute transition-all duration-500 ${styles[index]}`}
                  >
                    <Image
                      src={el.link}
                      alt="auth image"
                      width={320}
                      height={420}
                      className="rounded-2xl shadow-2xl object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        Join a community that values meaningful conversation
      </div>
    </div>
  );
}

//<div className="absolute inset-0">
//        <Image
//          src="/images/hero/hero3.jpg"
//          alt="auth background image"
//          fill
//          priority
//          className="object-cover"
//          sizes="100vw"
//        />
//        <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" />
//      </div>
