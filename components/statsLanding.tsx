"use client";

import AnimatedCounter from "./animatedCounter";

const StatsLanding = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20 mb-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Trusted by developers from all over the world
        </h2>
        <p className="mt-3 text-xl text-blue-5 sm:mt-4">
          See the impact we&apos;ve made over the past 5 years.
        </p>
      </div>
      <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
        <div className="flex flex-col ">
          <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-5 bg-">
            Happy Customers
          </dt>
          <dd className="order-1 text-5xl font-extrabold text-white">
            <AnimatedCounter from={0} to={10} />k
          </dd>
        </div>
        <div className="flex flex-col mt-10 sm:mt-0">
          <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-5">
            Passed interviews with flying colors
          </dt>
          <dd className="order-1 text-5xl font-extrabold text-white">
            <AnimatedCounter from={0} to={7} />k
          </dd>
        </div>
        <div className="flex flex-col mt-10 sm:mt-0">
          <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-5">
            Questions generated
          </dt>
          <dd className="order-1 text-5xl font-extrabold text-white">
            <AnimatedCounter from={0} to={50} />
            k+
          </dd>
        </div>
      </dl>
    </div>
  );
};
export default StatsLanding;
