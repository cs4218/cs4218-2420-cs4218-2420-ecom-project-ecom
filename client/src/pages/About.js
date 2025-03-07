import React from "react";
import Layout from "./../components/Layout";

const About = () => {
  return (
    <Layout title={"About us - Ecommerce app"}>
      <div className="row contactus" data-testid="about-container">
        <div className="col-md-6" data-testid="image-column">
          <img
            src="/images/about.jpeg"
            alt="contactus"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-4" data-testid="text-column">
          <p className="text-justify mt-2">
            Add text
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
