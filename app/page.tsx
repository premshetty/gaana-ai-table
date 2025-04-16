import DataTable from "../components/DataTable";


const Home = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl mx-auto text-center font-semibold mb-1  ">User Management
        <span className="text-sm text-gray-500 ">
          (Click on the table headers to sort the data)
        </span>
      </h1>
      <DataTable />
    </div>
  );
};

export default Home;
