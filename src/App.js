import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SystemHealthWidget from "./SystemHealthWidget";
import NotFound404 from "./NotFound404";
import MainLayout from "./layout/MainLayout";
import { AuthProvider } from "./auth/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* корневая страница */}
          <Route
            path="/"
            element={
              <MainLayout>
                <h1>Главная на Dev Wiki</h1>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Praesent lacinia lorem in tortor hendrerit scelerisque.
                  Mauris aliquet dignissim mauris nec faucibus. Aliquam eget
                  est id ipsum scelerisque imperdiet. In et commodo neque.
                  Nullam malesuada tellus diam, a venenatis odio condimentum
                  id. Aliquam sollicitudin nisl ut porttitor tempus. Phasellus
                  ut euismod eros. Mauris tempor tempus ullamcorper. Aenean
                  eget porta quam. In imperdiet tellus at leo egestas, sed
                  hendrerit magna malesuada. Class aptent taciti sociosqu ad
                  litora torquent per conubia nostra, per inceptos himenaeos.
                  Aenean purus nibh, venenatis finibus porta id, tempus vel
                  lectus.
                </p>
                <h2>Paragraph 2</h2>
                <p>
                  Pellentesque sapien lacus, finibus at convallis at, iaculis
                  in diam. Sed ornare, mi ac scelerisque rhoncus, orci tellus
                  finibus orci, vitae condimentum urna erat vel quam. Donec
                  rutrum dictum magna, quis molestie neque efficitur a.
                  Praesent tincidunt convallis mi, egestas cursus magna
                  fermentum malesuada. Pellentesque facilisis finibus nibh eget
                  tempus. Curabitur nec lorem sit amet libero eleifend
                  tincidunt vitae at erat. Proin at commodo metus, nec commodo
                  urna. Morbi euismod dolor vel ligula vestibulum, vel
                  porttitor elit lacinia. Mauris non turpis et tellus ornare
                  sollicitudin. Aenean facilisis ut nulla quis cursus. In
                  porttitor lectus erat, nec egestas libero molestie elementum.
                  Donec ut dapibus ipsum. Donec rhoncus nisi sit amet tellus
                  finibus, et semper leo laoreet.
                </p>
                <p>
                  Class aptent taciti sociosqu ad litora torquent per conubia
                  nostra, per inceptos himenaeos. Aenean cursus, sapien eget
                  luctus congue, neque sapien vulputate orci, ac cursus mauris
                  dui vel purus. Vestibulum eros dolor, placerat sed consequat
                  non, pulvinar quis ligula. Curabitur feugiat ex quis tempus
                  vulputate. Donec efficitur odio in mauris viverra cursus. Nam
                  ut metus ex. Proin eu leo condimentum, laoreet nisi at,
                  vulputate libero.
                </p>
                <p>
                  Sed faucibus a est vestibulum efficitur. Sed id ultricies
                  erat, in hendrerit orci. Suspendisse risus metus, ultrices at
                  ligula commodo, eleifend tristique est. Proin tempus leo
                  eros, quis pellentesque arcu maximus quis. Morbi blandit,
                  elit eget pretium placerat, nisl ex ullamcorper orci, a
                  pellentesque leo mauris vitae lacus. Mauris imperdiet sit
                  amet enim at feugiat. Praesent lobortis arcu ac enim
                  faucibus, ut pharetra libero placerat.
                </p>
                <p>
                  Integer elementum lacus bibendum commodo porttitor. Curabitur
                  malesuada magna mauris, sit amet bibendum orci euismod eu.
                  Proin mollis ex id risus bibendum porta. Nullam ut eros diam.
                  Vivamus vehicula, felis a accumsan tincidunt, ipsum mauris
                  aliquam mauris, sit amet congue odio lectus in lectus. Sed
                  eleifend cursus metus at finibus. Integer tincidunt neque nec
                  metus facilisis rutrum. Pellentesque et pulvinar elit.
                </p>
              </MainLayout>
            }
          />

          {/* health-страница */}
          <Route path="/health" element={<SystemHealthWidget />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <MainLayout>
                <NotFound404 />
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
